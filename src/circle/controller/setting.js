const Base = require('./base.js');
const fs = require('fs');
const images = require('images');

module.exports = class extends Base {
  async listAction() {
    const title = this.post('title');
    const province = this.post('province');
    const whereMap = {};
    if (!think.isEmpty(province)) {
      whereMap['s.province'] = province;
    }
    if (!think.isEmpty(title)) {
      whereMap['s.title|s.description'] = ['like', '%' + title + '%'];
    }
    const model = this.model('service').alias('s');
    model.field(['s.*', 'u.name', 'u.province_name', 'u.city_name', 'u.phone']).join({
      table: 'user',
      join: 'inner',
      as: 'u',
      on: ['s.user_id', 'u.id']
    });
    const list = await model.where(whereMap).select();
    this.json(list);
  }
  async openAction() {
    const title = this.post('title');
    const userId = this.getLoginUserId();
    const bowlType = this.post('bowlType');
    const bowlFilter = this.post('bowlFilter');
    const bowlSystem = this.post('bowlSystem');
    const bowlSize = this.post('bowlSize');
    const setting = {
      title,
      user_id: userId,
      bowl_type: bowlType,
      bowl_filter: bowlFilter,
      bowl_system: bowlSystem,
      bowl_size: bowlSize
    };
    const settingObj = await this.model('circle_setting').add(setting);
    this.json(settingObj);
  }
  async getByUserIdAction() {
    const userId = this.getLoginUserId();
    const settingObj = await this.model('circle_setting').where({user_id: userId}).find();
    this.json(settingObj);
  }
  async updateAction() {
    const title = this.post('title');
    const userId = this.getLoginUserId();
    const bowlType = this.post('bowlType');
    const bowlFilter = this.post('bowlFilter');
    const bowlSystem = this.post('bowlSystem');
    const bowlSize = this.post('bowlSize');
    const bowlBrand = this.post('bowlBrand');
    const lightBrand = this.post('lightBrand');
    const proteinType = this.post('proteinType');
    const streamType = this.post('streamType');
    const setting = {
      title,
      bowl_type: bowlType,
      bowl_filter: bowlFilter,
      bowl_system: bowlSystem,
      bowl_size: bowlSize,
      bowl_brand: bowlBrand,
      light_brand: lightBrand,
      protein_type: proteinType,
      stream_type: streamType

    };
    const settingObj = await this.model('circle_setting').where({user_id: userId}).update(setting);
    this.json(settingObj);
  }
  async uploadAction() {
    const userId = this.getLoginUserId();
    const img = this.file('file');
    let timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    const name = timestamp + '-' + userId + '.png';
    // const thumbUrl = this.config('image.circle') + '/' + name;
    const thumbSmallUrl = this.config('image.circle') + '/small/' + name;
    const settingObj = await this.model('circle_setting').where({user_id: userId}).find();
    if (settingObj.cover_url) {
      const orgPath = settingObj.cover_url.replace('https://static.huanjiaohu.com/image/circle/small/', '');
      const smallPath = this.config('image.circle') + '/small/' + orgPath;
      fs.unlinkSync(smallPath);
    }
    images(img.path + '').resize(375).save(thumbSmallUrl);
    await this.model('circle_setting').where({user_id: userId}).update({ cover_url: 'https://static.huanjiaohu.com/image/circle/small/' + name });
    this.json({cover_url: 'https://static.huanjiaohu.com/image/circle/small/' + name});
  }
};
