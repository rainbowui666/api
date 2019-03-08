
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
      image_url: 'https://static.huanjiaohu.com/image/ad/' + name
    };
    const id = await this.model('mall_ad').add(ad);
    ad.id = id;
    return this.json(ad);
  }
  async getAdByPositionAction() {
    const positionId = this.post('positionId');
    const province = this.post('province');
    const list = await this.model('mall_ad').where({ad_position_id: positionId, province}).select();
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
    const link = this.post('link') || '/pages/index/main';
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
};
