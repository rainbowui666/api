const Base = require('./base.js');

module.exports = class extends Base {
  /**
   * 获取用户的收货地址
   * @return {Promise} []
   */
  async listAction() {
    const addressList = await this.model('address').where({user_id: this.getLoginUserId()}).select();
    let itemKey = 0;
    for (const addressItem of addressList) {
      addressList[itemKey].province_name = await this.model('region').where({id: addressItem.province_id}).getField('name', true);
      addressList[itemKey].city_name = await this.model('region').where({id: addressItem.city_id}).getField('name', true);
      addressList[itemKey].district_name = await this.model('region').where({id: addressItem.district_id}).getField('name', true);
      addressList[itemKey].full_region = addressList[itemKey].province_name + addressList[itemKey].city_name + addressList[itemKey].district_name;
      itemKey += 1;
    }

    return this.success(addressList);
  }

  async getDefaultAction() {
    const addressInfo = await this.model('address').where({user_id: this.getLoginUserId(), is_default: 1}).find();

    return this.json(addressInfo);
  }

  /**
   * 获取收货地址的详情
   * @return {Promise} []
   */
  async detailAction() {
    const addressId = this.get('id');

    const addressInfo = await this.model('address').where({user_id: this.getLoginUserId(), id: addressId}).find();
    if (!think.isEmpty(addressInfo)) {
      addressInfo.province_name = await this.model('region').where({id: addressInfo.province_id}).getField('name', true);
      addressInfo.city_name = await this.model('region').where({id: addressInfo.city_id}).getField('name', true);
      addressInfo.district_name = await this.model('region').where({id: addressInfo.district_id}).getField('name', true);
      addressInfo.full_region = addressInfo.province_name + addressInfo.city_name + addressInfo.district_name;
    }

    return this.success(addressInfo);
  }

  /**
   * 添加或更新收货地址
   * @returns {Promise.<Promise|PreventPromise|void>}
   */
  async saveAction() {
    let addressId = this.post('id');

    const addressData = {
      name: this.post('name'),
      mobile: this.post('mobile'),
      province_id: this.post('province_id'),
      city_id: this.post('city_id'),
      district_id: this.post('district_id'),
      address: this.post('address'),
      user_id: this.getLoginUserId(),
      is_default: this.post('is_default') === true ? 1 : 0
    };

    if (think.isEmpty(addressId)) {
      addressId = await this.model('address').add(addressData);
    } else {
      await this.model('address').where({id: addressId, user_id: this.getLoginUserId()}).update(addressData);
    }

    // 如果设置为默认，则取消其它的默认
    if (this.post('is_default') === true) {
      await this.model('address').where({id: ['<>', addressId], user_id: this.getLoginUserId()}).update({
        is_default: 0
      });
    }
    const addressInfo = await this.model('address').where({id: addressId}).find();

    return this.success(addressInfo);
  }

  /**
   * 删除指定的收货地址
   * @returns {Promise.<Promise|PreventPromise|void>}
   */
  async deleteAction() {
    const addressId = this.post('id');

    await this.model('address').where({id: addressId, user_id: this.getLoginUserId()}).delete();

    return this.success('删除成功');
  }
};
