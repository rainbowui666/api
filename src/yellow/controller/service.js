const Base = require('./base.js');
module.exports = class extends Base {
  async listAction() {
    const title = this.post('title');
    const province = this.post('province');
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const whereMap = {};
    whereMap['province'] = province;
    if (!think.isEmpty(title)) {
      whereMap['title|description'] = ['like', '%' + title + '%'];
    }
    const list = await this.model('service').where(whereMap).page(page, size).countSelect();
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
