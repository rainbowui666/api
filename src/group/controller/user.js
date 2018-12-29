const Base = require('./base.js');
module.exports = class extends Base {
  async listAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const name = this.post('name');
    const city = this.post('city');
    const province = this.post('province');
    const type = this.post('type');
    const whereMap = {};
    if (!think.isEmpty(province)) {
      whereMap['u.province'] = province;
    }
    if (!think.isEmpty(type)) {
      const typeDef = await this.model('user_type').where({'code': type}).find();
      whereMap['r.type_id'] = typeDef.id;
    }
    if (!think.isEmpty(city)) {
      whereMap['u.city'] = city;
    }
    if (!think.isEmpty(name)) {
      whereMap['u.name'] = ['like', `%${name}%`];
    }
    const model = this.model('user').alias('u');
    const list = await model.field(['u.*', 'c.name city_name', 'p.name province_name'])
      .join({
        table: 'citys',
        join: 'inner',
        as: 'c',
        on: ['u.city', 'c.mark']
      })
      .join({
        table: 'provinces',
        join: 'inner',
        as: 'p',
        on: ['u.province', 'p.code']
      })
      .join({
        table: 'user_type_relation',
        join: 'inner',
        as: 'r',
        on: ['r.user_id', 'u.id']
      })
      .where(whereMap).order(['u.id DESC']).page(page, size).countSelect();

    for (const item of list.data) {
      delete item.password;
    }
    this.json(list);
  }
};
