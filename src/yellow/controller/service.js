const Base = require('./base.js');
const _ = require('lodash');

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
    model.field(['s.*', 'u.name', 'u.province_name', 'u.city_name']).join({
      table: 'user',
      join: 'inner',
      as: 'u',
      on: ['s.user_id', 'u.id']
    });
    const list = await model.where(whereMap).select();
    this.json(list);
  }
  async getByUserIdAction() {
    const userId = this.post('userId');
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const whereMap = {};
    whereMap['user_id'] = userId;
    const list = await this.model('service').where(whereMap).page(page, size).countSelect();
    this.json(list);
  }
  async getByIdAction() {
    const id = this.post('id');
    const whereMap = {};
    whereMap['id'] = id;
    const service = await this.model('service').where(whereMap).find();
    this.json(service);
  }
};
