const Base = require('./base.js');
module.exports = class extends Base {
  async addAction() {
    const title = this.post('title');
    const description = this.post('description');
    const province = this.post('province');
    const location = this.post('location');
    const userId = this.post('userId');
    const longitude = this.post('longitude');
    const latitude = this.post('latitude');
    const scope = this.post('scope');
    const type = this.post('type');
    await this.model('service').add({
      title,
      description,
      province,
      location,
      longitude,
      latitude,
      scope,
      type,
      'user_id': userId
    });
  }
  async updateAction() {
    const id = this.post('id');
    const title = this.post('title');
    const description = this.post('description');
    const province = this.post('province');
    const location = this.post('location');
    const longitude = this.post('longitude');
    const latitude = this.post('latitude');
    const scope = this.post('scope');
    const type = this.post('type');
    await this.model('service').where({id}).update({
      title,
      description,
      province,
      location,
      longitude,
      latitude,
      scope,
      type
    });
  }
  async deleteAction() {
    const id = this.post('id');
    await this.model('service').where({id}).delete();
  }
  async listAction() {
    const title = this.post('title');
    const province = this.post('province');
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const whereMap = {};
    if (!think.isEmpty(province)) {
      whereMap['u.province'] = province;
    }
    if (!think.isEmpty(title)) {
      whereMap['s.title|s.description'] = ['like', '%' + title + '%'];
    }
    const model = this.model('service').alias('s');
    model.field(['s.*', 'u.name', 'u.province_name']).join({
      table: 'user',
      join: 'inner',
      as: 'u',
      on: ['s.user_id', 'u.id']
    });
    const list = await model.where(whereMap).page(page, size).countSelect();
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
