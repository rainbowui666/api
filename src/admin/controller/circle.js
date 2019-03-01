const Base = require('./base.js');
const fs = require('fs');
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
    switch (Number(c['bowlType'])) {
      case 0:
        c['tag'] = ['SPS缸'];
        break;
      case 1:
        c['tag'] = ['LPS缸'];
        break;
      case 2:
        c['tag'] = ['FOT缸'];
        break;
      default:
        c['tag'] = ['青魔'];
        break;
    }
    c['interaction'] = {};
    c['interaction']['praiseList'] = praiselist;
    c['interaction']['commentList'] = commentList;
  }

  async listAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const model = this.buildModel();
    const list = await model.order('c.insert_date DESC').page(page, size).countSelect();
    for (const c of list.data) {
      await this.handleCircle(c);
    }
    this.json(list);
  }

  async imagelistAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const list = await this.model('circle_img').order('id DESC').page(page, size).countSelect();
    this.json(list);
  }

  async deleteAction() {
    const circleId = this.post('circleId');
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
  async deleteImageAction() {
    const circleImgId = this.post('circleImgId');
    const circleImg = await this.model('circle_img').where({ id: circleImgId }).find();
    const orgPath = circleImg.url.replace('https://static.huanjiaohu.com/image/circle/small/', '');
    const path = this.config('image.circle') + '/' + orgPath;
    const smallPath = this.config('image.circle') + '/small/' + orgPath;
    await this.model('circle_img').where({ id: circleImgId }).delete();
    fs.unlinkSync(path);
    fs.unlinkSync(smallPath);
    this.success('操作成功');
  }
  async commentDeleteAction() {
    const typeId = this.post('typeId');
    const valueId = this.post('valueId');
    const commentId = this.post('commentId');
    await this.model('comment').where({id: commentId}).delete();
    const commentList = await this.getCommentList(typeId, valueId);
    this.json(commentList);
  }
};
