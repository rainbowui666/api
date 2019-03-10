
const Base = require('./base.js');
const fs = require('fs');
module.exports = class extends Base {
  async listPositionAction() {
    const list = await this.model('mall_ad_position').where('id > 9').select();
    return this.json(list);
  }
  async uploadAction() {
    const positionId = this.post('positionId');
    const province = this.post('province');
    const url = this.post('url');
    const link = this.post('link');
    const order = this.post('order');

    const img = this.file('img');
    const _name = img.name;
    const tempName = _name.split('.');
    let timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    const name = timestamp + '.' + tempName[1];
    const thumbUrl = this.config('image.ad') + '/' + name;
    fs.renameSync(img.path, thumbUrl);
    const ad = {
      ad_position_id: positionId,
      province,
      url,
      link,
      enabled: order,
      image_url: 'https://static.huanjiaohu.com/image/ad/' + name
    };
    const id = await this.model('mall_ad').add(ad);
    ad.id = id;
    return this.json(ad);
  }
  async getAdByPositionAction() {
    const positionId = this.post('positionId');
    const province = this.post('province');
    const list = await this.model('mall_ad').where({ad_position_id: positionId, province}).order('enabled asc').select();
    return this.json(list);
  }
  async deleteAction() {
    const id = this.post('id');
    const ad = await this.model('mall_ad').where({id}).find();
    if (!think.isEmpty(ad['image_url']) && think.isEmpty(ad['content'])) {
      fs.unlinkSync(this.config('image.ad') + '/' + ad['image_url'].replace('https://static.huanjiaohu.com/image/ad/', ''));
    }
    const number = await this.model('mall_ad').where({id}).delete();
    return this.json(number);
  }
  async addAction() {
    const positionId = this.post('positionId');
    if (positionId === 2 || positionId === 3 || positionId === 4) {
      await this.model('mall_ad').where({ad_position_id: positionId}).delete();
    }
    const province = this.post('province');
    const url = this.post('url');
    const link = this.post('link');
    const content = this.post('content');
    const imageUrl = 'https://static.huanjiaohu.com/image/ad/';
    const ad = {
      ad_position_id: positionId,
      url,
      link,
      province,
      content,
      image_url: imageUrl
    };
    const id = await this.model('mall_ad').add(ad);
    ad.id = id;
    return this.json(ad);
  }
  async updateAction() {
    const id = this.post('id');
    const url = this.post('url');
    const province = this.post('province');
    const link = this.post('link');
    const content = this.post('content');
    const order = this.post('order');
    const ad = {
      url,
      link,
      province,
      content,
      enabled: order
    };
    await this.model('mall_ad').where({id}).update(ad);
    return this.json(ad);
  }
};
