module.exports = class extends think.Model {
  /**
   * 根据快递公司编码获取名称
   * @param shipperCode
   * @returns {Promise.<*>}
   */
  async getShipperNameByCodeAction(shipperCode) {
    return this.model('shipper').where({ code: shipperCode }).getField('name', true);
  }

  /**
   * 根据 id 获取快递公司信息
   * @param shipperId
   * @returns {Promise.<*>}
   */
  async getShipperByIdAction(shipperId) {
    return this.model('shipper').where({ id: shipperId }).find();
  }

  async shipperListAction() {
    return this.model('shipper').select();
  }
};
