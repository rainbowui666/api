
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
    if (!think.isEmpty(ad['image_url'])) {
      fs.unlinkSync(this.config('image.ad') + '/' + ad['image_url'].replace('https://static.huanjiaohu.com/image/brand/', ''));
    }
    const number = await this.model('mall_ad').where({id}).delete();
    return this.json(number);
  }
};
