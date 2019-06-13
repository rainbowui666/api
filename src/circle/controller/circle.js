const Base = require('./base.js');
const fs = require('fs');
const images = require('images');

module.exports = class extends Base {
  async getByUserIdAction() {
    const userId = this.post('userId') || this.getLoginUserId();
    const type = this.post('type') || 0;
    const circle = await this.model('circle').where({ 'user_id': userId, 'type': type }).find();
    this.json(circle);
  }
  async getCircleByIdAction() {
    const model = this.buildModel();
    const c = await model.where({ 'c.id': this.post('circleId') }).order('c.insert_date DESC').find();
    await this.handleCircle(c);
    this.json(c);
  }

  async myCircleListAction() {
    const model = this.model('circle').alias('c');
    model.field(['distinct c.id']).join({
      table: 'circle_img',
      join: 'inner',
      as: 'i',
      on: ['i.circle_id', 'c.id']
    });
    const where = { 'c.type': 0, 'c.status': 0 };
    const list = await model.where(where).order('c.id DESC').select();
    const returnList = {data: []};
    for (const c of list) {
      const cModel = this.buildModel();
      const circle = await cModel.where({ 'c.id': c.id }).order('c.insert_date DESC').find();
      await this.handleCircle(circle);
      returnList.data.push(circle);
    }
    return this.json(returnList);
  }

  buildModel() {
    const model = this.model('circle').alias('c');
    model.field(['c.*', 'u.headimgurl', 'u.city_name', 'u.name', 'u.tag', 's.bowl_type bowlType', 's.bowl_filter bowlFilter', 's.bowl_system bowlSystem', 's.bowl_size bowlSize', 's.bowl_brand bowlBrand', 's.light_brand lightBrand', 's.protein_type proteinType', 's.stream_type streamType', 's.cover_url coverUrl']).join({
      table: 'user',
      join: 'inner',
      as: 'u',
      on: ['c.user_id', 'u.id']
    }).join({
      table: 'circle_setting',
      join: 'left',
      as: 's',
      on: ['s.user_id', 'u.id']
    });
    return model;
  }

  async handleCircle(c) {
    const imageList = await this.model('circle_img').where({ circle_id: c.id }).select();
    const praiselist = await this.model('focus').where({ circle_id: c.id }).select();
    const comments = await this.model('comment').where({ type_id: 2, value_id: c.id }).select();
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
      comment.add_time = commentItem.add_time;
      comment.user_info = await this.model('user').field(['id', 'name', 'headimgurl']).where({ id: commentItem.user_id }).find();
      comment.parent_comment = commentItem.new_content ? JSON.parse(commentItem.new_content) : null;
      commentList.push(comment);
    }
    c['insert_date'] = new Date(c['insert_date']).getTime();
    c['time'] = think.datetime(new Date(c['insert_date']), 'YYYY-MM-DD');

    switch (Number(c['category'])) {
      case 0:
        c['tag'] = ['晒缸'];
        break;
      case 1:
        c['tag'] = ['二手'];
        break;
      case 2:
        c['tag'] = ['广告'];
        break;
      default:
        break;
    }
    switch (Number(c['bowlType'])) {
      case 0:
        c['tag'].push('SPS缸');
        break;
      case 1:
        c['tag'].push('LPS缸');
        break;
      case 2:
        c['tag'].push('FOT缸');
        break;
      default:
        break;
    }
    c['interaction'] = {};
    c['interaction']['praiseList'] = praiselist;
    c['interaction']['commentList'] = commentList;
  }

  async listAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const category = this.post('category');
    const type = this.post('type');
    const filter = this.post('filter');
    const system = this.post('system');
    const zone = this.post('zone');
    const dimension = this.post('dimension');
    const model = this.buildModel();
    const where = { 'c.type': 1, 'c.status': 1 };
    if (!think.isEmpty(category)) {
      where['c.category'] = category;
    } else if (category === 0) {
      where['c.category'] = category;
    } else {
      where['c.category'] = 0;
    }
    if (!think.isEmpty(type)) {
      where['s.bowl_type'] = type;
    }
    if (!think.isEmpty(filter)) {
      where['s.bowl_filter'] = filter;
    }
    if (!think.isEmpty(system)) {
      where['s.bowl_system'] = system;
    }
    if (!think.isEmpty(dimension)) {
      where['s.bowl_size'] = dimension;
    }
    if (!think.isEmpty(zone)) {
      const user = this.getLoginUser();
      if (zone === 'province') {
        where['u.province'] = user.province;
      }
      if (zone === 'city') {
        where['u.city'] = user.city;
      }
    }

    const list = await model.where(where).order('c.insert_date DESC').page(page, size).countSelect();
    for (const c of list.data) {
      await this.handleCircle(c);
    }
    this.json(list);
  }
  async getCommentsAction() {
    const comments = await this.model('comment').where({ type_id: 2, value_id: this.post('circleId') }).select();
    const commentList = [];
    for (const commentItem of comments) {
      const comment = {};
      comment.content = Buffer.from(commentItem.content, 'base64').toString();
      comment.type_id = commentItem.type_id;
      comment.value_id = commentItem.value_id;
      comment.id = commentItem.id;
      comment.add_time = think.datetime(new Date(commentItem.add_time * 1000), 'YYYY-MM-DD');
      comment.user_info = await this.model('user').field(['id', 'name', 'headimgurl']).where({ id: commentItem.user_id }).find();
      comment.parent_comment = commentItem.new_content ? JSON.parse(commentItem.new_content) : null;
      commentList.push(comment);
    }
    this.json(commentList);
  }
  async createAction() {
    const userId = this.post('userId') || this.getLoginUserId();
    const type = this.post('type');
    const circle = { user_id: userId, type };
    const id = await this.model('circle').add(circle);
    this.json(id);
  }
  async addAction() {
    const circleId = this.post('circleId');
    const category = this.post('category');
    const description = this.post('description');
    const id = await this.model('circle').where({ id: circleId }).update({ status: 1, description, category });
    this.json(id);
  }
  async deleteAction() {
    const circleId = this.post('circleId');
    const userId = this.getLoginUserId();
    const circle = await this.model('circle').where({ id: circleId, user_id: userId }).find();
    if (!think.isEmpty(circle)) {
      await this.model('circle_img').where({ circle_id: circleId }).delete();
      await this.model('comment').where({ type_id: 2, value_id: circleId }).delete();
      await this.model('circle').where({ id: circleId }).delete();
      const list = await this.model('circle_img').where({ circle_id: circleId }).select();
      for (const c of list) {
        const orgPath = c.url.replace('https://static.huanjiaohu.com/image/circle/small/', '');
        const path = this.config('image.circle') + '/' + orgPath;
        const smallPath = this.config('image.circle') + '/small/' + orgPath;
        fs.unlinkSync(path);
        fs.unlinkSync(smallPath);
      }
      this.success('操作成功');
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
      await this.model('circle_img').where({ id: circleImgId }).delete();
      fs.unlinkSync(path);
      fs.unlinkSync(smallPath);
      this.success('操作成功');
    } else {
      this.fail('没有权限');
    }
  }
  generateMixed(an) {
    const chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    let res = '';
    for (let ia = 0; ia < an; ia++) {
      const id = Math.ceil(Math.random() * 35);
      res += chars[id];
    }
    return res;
  }
  async uploadAction() {
    const circleId = this.post('circleId');
    const img = this.file('file');
    const _name = img.name;
    const tempName = _name.split('.');
    const timestamp = this.generateMixed(9);
    const name = timestamp + '-' + circleId + '.' + tempName[tempName.length - 1];
    const thumbUrl = this.config('image.circle') + '/' + name;
    const thumbSmallUrl = this.config('image.circle') + '/small/' + name;
    fs.renameSync(img.path, thumbUrl);
    images(thumbUrl + '').resize(96).save(thumbSmallUrl);
    const imgObj = await this.model('circle_img').add({ circle_id: circleId, url: 'https://static.huanjiaohu.com/image/circle/small/' + name });
    return this.json(imgObj);
  }
  async praiseAction() {
    const userId = this.getLoginUserId();
    const focus = await this.model('focus').where({ user_id: userId, circle_id: this.post('circleId') }).find();
    if (think.isEmpty(focus)) {
      await this.model('focus').add({ user_id: userId, circle_id: this.post('circleId') });
    } else {
      await this.model('focus').where({ user_id: userId, circle_id: this.post('circleId') }).delete();
    }
    const list = await this.model('focus').where({ circle_id: this.post('circleId') }).select();
    this.json(list);
  }
  async commentDeleteAction() {
    const typeId = this.post('typeId');
    const valueId = this.post('valueId');
    const commentId = this.post('commentId');
    await this.model('comment').where({id: commentId}).delete();
    const commentList = await this.getCommentList(typeId, valueId);
    this.json(commentList);
  }
  async commentPostAction() {
    const typeId = this.post('typeId');
    const valueId = this.post('valueId');
    const content = this.post('content');
    const parentComment = this.post('parentComment');
    const buffer = Buffer.from(content);
    await this.model('comment').add({
      type_id: typeId,
      value_id: valueId,
      content: buffer.toString('base64'),
      add_time: this.getTime(),
      user_id: this.getLoginUserId(),
      new_content: JSON.stringify(parentComment)
    });
    const commentList = await this.getCommentList(typeId, valueId);
    this.json(commentList);
  }

  async getCommentList(typeId, valueId) {
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
      comment.user_info = await this.model('user').field(['id', 'name', 'headimgurl']).where({ id: commentItem.user_id }).find();
      comment.parent_comment = commentItem.new_content ? JSON.parse(commentItem.new_content) : null;
      commentList.push(comment);
    }
    return commentList;
  }
};
