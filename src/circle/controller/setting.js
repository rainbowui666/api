const Base = require('./base.js');

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
    const type = this.post('type');
    const filter = this.post('filter');
    const bowlSystem = this.post('bowlSystem');
    const size = this.post('size');
    const setting = {
      title,
      user_id: userId,
      type,
      filter,
      bowl_system: bowlSystem,
      size
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
    const type = this.post('type');
    const filter = this.post('filter');
    const bowlSystem = this.post('bowlSystem');
    const size = this.post('size');
    const bowlBrand = this.post('bowlBrand');
    const lightBrand = this.post('lightBrand');
    const proteinType = this.post('proteinType');
    const streamType = this.post('streamType');
    const setting = {
      title,
      type,
      filter,
      bowl_system: bowlSystem,
      size,
      bowl_brand: bowlBrand,
      light_brand: lightBrand,
      protein_type: proteinType,
      stream_type: streamType

    };
    const settingObj = await this.model('circle_setting').where({user_id: userId}).update(setting);
    this.json(settingObj);
  }
};
