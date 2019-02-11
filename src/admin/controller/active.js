const Base = require('./base.js');
const fs = require('fs');

module.exports = class extends Base {
  async addAction() {
    const endDate = this.post('endDate');
    const parentId = this.post('parentId');
    const type = this.post('type');
    const title = this.post('title');
    const digest = this.post('digest');
    const url = this.post('url');
    const content = this.post('content');
    const target = this.post('target');
    const isGoto = this.post('isGoto') || 0;
    const effortDate = this.service('date', 'api').convertWebDateToSubmitDateTime(endDate);
    const active = {
      'end_date': effortDate,
      'parent_id': parentId,
      type,
      title,
      digest,
      url,
      content,
      target,
      isGoto
    };
    const activeObj = await this.model('active').add(active);
    this.json(activeObj);
  }
  async updateAction() {
    const id = this.post('activeId');
    const endDate = this.post('endDate');
    const parentId = this.post('parentId');
    const type = this.post('type');
    const title = this.post('title');
    const digest = this.post('digest');
    const url = this.post('url');
    const content = this.post('content');
    const target = this.post('target');
    const isGoto = this.post('isGoto') || 0;
    const effortDate = this.service('date', 'api').convertWebDateToSubmitDateTime(endDate);

    const active = {
      'end_date': effortDate,
      'parent_id': parentId,
      type,
      title,
      digest,
      url,
      content,
      target,
      isGoto
    };
    const activeObj = await this.model('active').where({id}).update(active);
    this.json(activeObj);
  }
  async deleteAction() {
    const id = this.post('activeid');
    const active = await this.model('active').where({parent_id: id}).find();
    if (think.isEmpty(active)) {
      await this.model('active').where({id}).delete();
      this.success('操作成功');
    } else {
      this.fail('请先删除子活动');
    }
  }
  async uploadAction() {
    const activeId = this.post('activeId');
    const img = this.file('img');
    const _name = img.name;
    const tempName = _name.split('.');
    let timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    const name = timestamp + '-' + activeId + '.' + tempName[1];
    const thumbUrl = this.config('image.active') + '/' + name;
    const active = await this.model('active').where({id: activeId}).find();
    if (!think.isEmpty(active.thumb_url)) {
      fs.unlinkSync(this.config('image.active') + '/' + active.thumb_url.replace('https://static.huanjiaohu.com/image/active/', ''));
    }
    fs.renameSync(img.path, thumbUrl);
    await this.model('active').where({id: activeId}).update({thumb_url: 'https://static.huanjiaohu.com/image/active/' + name});
    this.success('操作成功');
  }
};
