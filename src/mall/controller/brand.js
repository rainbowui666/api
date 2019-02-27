const Base = require('./base.js');

module.exports = class extends Base {
  async listAction() {
    const model = this.model('mall_brand');
    const data = await model.page(this.get('page') || 1, this.get('size') || 10).countSelect();

    return this.success(data);
  }

  async detailAction() {
    const model = this.model('mall_brand');
    const data = await model.where({id: this.get('id')}).find();

    return this.success({brand: data});
  }
};
