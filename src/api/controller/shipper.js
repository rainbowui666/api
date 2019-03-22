module.exports = class extends think.Model {
  /**
   * 根据快递公司编码获取名称
   * @param shipperCode
   * @returns {Promise.<*>}
   */
  async getShipperNameByCodeAction(shipperCode) {
    const obj = await this.model('shipper').where({ code: shipperCode }).getField('name', true);
    return this.json(obj);
  }

  /**
   * 根据 id 获取快递公司信息
   * @param shipperId
   * @returns {Promise.<*>}
   */
  async getShipperByIdAction(shipperId) {
    const obj = await this.model('shipper').where({ id: shipperId }).find();
    return this.json(obj);
  }

  async shipperListAction() {
    const obj = await this.model('shipper').select();
    return this.json(obj);
  }
};
