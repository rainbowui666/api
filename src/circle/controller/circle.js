const Base = require('./base.js');
const fs = require('fs');
const images = require('images');

module.exports = class extends Base {
  async listByUserIdAction() {
    const userId = this.getLoginUserId();
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const type = this.post('type') || 1;
    const model = this.model('circle').alias('c');
    model.field(['c.*', 'u.headimgurl', 'u.city_name', 'u.name', 'u.tag', 's.title']).join({
      table: 'user',
      join: 'inner',
      as: 'u',
      on: ['c.user_id', 'u.id']
    }).join({
      table: 'circle_setting',
      join: 'inner',
      as: 's',
      on: ['s.user_id', 'u.id']
    });
    const list = await model.where({'c.user_id': userId, 'c.type': type}).order('c.insert_date DESC').page(page, size).countSelect();
    for (const c of list.data) {
      const imageList = this.model('circle_img').where({circle_id: c.id}).select();
      c['imageList'] = imageList;
      c['time'] = this.service('date', 'api').convertWebDateToSubmitDateTime(c['insert_date']);
      c['tag'] = c['tag'] ? c['tag'].split(',') : ['青魔'];
    }
    this.json(list);
  }
  async listByProvinceAction() {
    const user = this.getLoginUser();
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const model = this.model('circle').alias('c');
    model.field(['c.*', 'u.headimgurl', 'u.city_name', 'u.name', 'u.tag', 's.title']).join({
      table: 'user',
      join: 'inner',
      as: 'u',
      on: ['c.user_id', 'u.id']
    }).join({
      table: 'circle_setting',
      join: 'inner',
      as: 's',
      on: ['s.user_id', 'u.id']
    });
    const list = await model.where({'u.province': user.province}).order('c.insert_date DESC').page(page, size).countSelect();
    for (const c of list.data) {
      const imageList = await this.model('circle_img').where({circle_id: c.id}).select();
      c['imageList'] = imageList;
      c['time'] = this.service('date', 'api').convertWebDateToSubmitDateTime(c['insert_date']);
      c['tag'] = c['tag'] ? c['tag'].split(',') : ['青魔'];
    }
    this.json(list);
  }
  async listByCommentAction() {
    const userId = this.getLoginUserId();
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const model = this.model('circle').alias('c');
    model.field(['c.*', 'u.headimgurl', 'u.city_name', 'u.name', 'u.tag', 's.title']).join({
      table: 'user',
      join: 'inner',
      as: 'u',
      on: ['c.user_id', 'u.id']
    }).join({
      table: 'circle_setting',
      join: 'inner',
      as: 's',
      on: ['s.user_id', 'u.id']
    });
    const list = await model.where({'c.user_id': userId}).order('c.insert_date DESC').page(page, size).countSelect();
    for (const c of list.data) {
      const imageList = await this.model('circle_img').where({circle_id: c.id}).select();
      c['imageList'] = imageList;
      c['time'] = this.service('date', 'api').convertWebDateToSubmitDateTime(c['insert_date']);
      c['tag'] = c['tag'] ? c['tag'].split(',') : ['青魔'];
    }
    this.json(list);
  }
  async listAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const model = this.model('circle').alias('c');
    model.field(['c.*', 'u.headimgurl', 'u.city_name', 'u.name', 'u.tag', 's.title']).join({
      table: 'user',
      join: 'inner',
      as: 'u',
      on: ['c.user_id', 'u.id']
    }).join({
      table: 'circle_setting',
      join: 'inner',
      as: 's',
      on: ['s.user_id', 'u.id']
    });
    const list = await model.order('c.insert_date DESC').page(page, size).countSelect();
    for (const c of list.data) {
      const imageList = await this.model('circle_img').where({circle_id: c.id}).select();
      const praiselist = await this.model('focus').where({circle_id: c.id}).select();
      const comments = await this.model('comment').where({type_id: 2, value_id: c.id}).select();
      c['imageList'] = imageList;
      c['thumImageList'] = imageList.map((item) => { return item.url });
      c['bigImageList'] = imageList.map((item) => { return item.url.replace('small/', '') });
      const commentList = [];
      for (const commentItem of comments) {
        const comment = {};
        comment.content = Buffer.from(commentItem.content, 'base64').toString();
        comment.type_id = commentItem.type_id;
        comment.value_id = commentItem.value_id;
        comment.id = commentItem.id;
        comment.add_time = think.datetime(new Date(commentItem.add_time * 1000), 'YYYY-MM-DD');
        comment.user_info = await this.model('user').field(['name', 'headimgurl']).where({id: commentItem.user_id}).find();
        commentList.push(comment);
      }
      c['time'] = think.datetime(new Date(c['insert_date']), 'YYYY-MM-DD');
      c['tag'] = c['tag'] ? c['tag'].split(',') : ['青魔'];
      c['interaction'] = {};
      c['interaction']['praiseList'] = praiselist;
      c['interaction']['commentList'] = commentList;
    }
    this.json(list);
  }
  async createAction() {
    const userId = this.getLoginUserId();
    const type = this.post('type');
    const circle = {user_id: userId, type};
    const id = await this.model('circle').add(circle);
    this.json(id);
  }
  async addAction() {
    const circleId = this.post('circleId');
    const description = this.post('description');
    const id = await this.model('circle').where({id: circleId}).update({status: 1, description});
    this.json(id);
  }
  async deleteAction() {
    const circleId = this.post('circleId');
    const userId = this.getLoginUserId();
    const circle = await this.model('circle').where({ id: circleId }).find();
    if (circle.user_id === userId) {
      const list = await this.model('circle_img').where({ circle_id: circleId }).select();
      for (const c of list) {
        const path = this.config('image.circle') + '/' + c.name.replace('https://static.huanjiaohu.com/image/circle/', '');
        fs.unlinkSync(path);
      }
      await this.model('circle_img').where({ circle_id: circleId }).delete();
      await this.model('circle').where({ id: circleId }).delete();
      this.success('操作成功');
    } else {
      this.fail('没有权限');
    }
  }
  async deleteImageAction() {
    const circleImgId = this.post('circleImgId');
    const circleImg = await this.model('circle_img').where({ id: circleImgId }).find();
    const userId = this.getLoginUserId();
    const circle = await this.model('circle').where({ id: circleImg.circle_id }).find();
    if (circle.user_id === userId) {
      const orgPath = circleImg.url.replace('https://static.huanjiaohu.com/image/circle/small/', '');
      const path = this.config('image.circle') + '/' + orgPath;
      const smallPath = this.config('image.circle') + '/small/' + orgPath;
      fs.unlinkSync(path);
      fs.unlinkSync(smallPath);
      this.success('操作成功');
    } else {
      this.fail('没有权限');
    }
  }
  async uploadAction() {
    const circleId = this.post('circleId');
    const img = this.file('file');
    const _name = img.name;
    const tempName = _name.split('.');
    let timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    const name = timestamp + '-' + circleId + '.' + tempName[tempName.length - 1];
    const thumbUrl = this.config('image.circle') + '/' + name;
    const thumbSmallUrl = this.config('image.circle') + '/small/' + name;
    fs.renameSync(img.path, thumbUrl);
    images(thumbUrl + '').resize(117).save(thumbSmallUrl);
    await this.model('circle_img').add({circle_id: circleId, url: 'https://static.huanjiaohu.com/image/circle/small/' + name});
    this.success('操作成功');
  }
  async praiseAction() {
    const userId = this.getLoginUserId();
    const focus = await this.model('focus').where({user_id: userId, circle_id: this.post('circleId')}).find();
    if (think.isEmpty(focus)) {
      await this.model('focus').add({user_id: userId, circle_id: this.post('circleId')});
    } else {
      await this.model('focus').where({user_id: userId, circle_id: this.post('circleId')}).delete();
    }
    const list = await this.model('focus').where({circle_id: this.post('circleId')}).select();
    this.json(list);
  }
  async commentPostAction() {
    const typeId = this.post('typeId');
    const valueId = this.post('valueId');
    const content = this.post('content');
    const buffer = Buffer.from(content);
    await this.model('comment').add({
      type_id: typeId,
      value_id: valueId,
      content: buffer.toString('base64'),
      add_time: this.getTime(),
      user_id: this.getLoginUserId()
    });
    const list = await this.model('comment').where({
      type_id: typeId,
      value_id: valueId
    }).select();
    const commentList = [];
    for (const commentItem of list) {
      const comment = {};
      comment.content = Buffer.from(commentItem.content, 'base64').toString();
      comment.type_id = commentItem.type_id;
      comment.value_id = commentItem.value_id;
      comment.id = commentItem.id;
      comment.add_time = think.datetime(new Date(commentItem.add_time * 1000), 'YYYY-MM-DD');
      comment.user_info = await this.model('user').field(['name', 'headimgurl']).where({id: commentItem.user_id}).find();
      commentList.push(comment);
    }
    this.json(commentList);
  }
};
