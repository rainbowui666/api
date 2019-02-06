const Base = require('./base.js');

module.exports = class extends Base {
  async getActiveListAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const type = this.post('type');
    const whereMap = {};
    if (!think.isEmpty(type)) {
      whereMap['type'] = type;
    }
    const list = await this.model('active').where(whereMap).order(['id DESC']).page(page, size).countSelect();
    this.json(list);
  }
};
