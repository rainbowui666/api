const Base = require('./base.js');
module.exports = class extends Base {
  /**
   * 根据快递公司编码获取名称
   * @param shipperCode
   * @returns {Promise.<*>}
   */
  async getShipperNameByCodeAction() {
    const shipperCode = this.post('shipperCode');
    const obj = await this.model('shipper').where({ code: shipperCode }).find();
    return this.json(obj);
  }

  /**
   * 根据 id 获取快递公司信息
   * @param shipperId
   * @returns {Promise.<*>}
   */
  async getShipperByIdAction() {
    const shipperId = this.post('shipperId');
    const obj = await this.model('shipper').where({ id: shipperId }).find();
    return this.json(obj);
  }

  async shipperListAction() {
    const obj = await this.model('shipper').select();
    return this.json(obj);
  }
};
