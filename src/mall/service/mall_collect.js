module.exports = class extends think.Service {
  /**
   * 判断用户是否收藏过该对象
   * @param userId
   * @param typeId
   * @param valueId
   * @returns {Promise.<boolean>}
   */
  async isUserHasCollect(userId, typeId, valueId) {
    const hasCollect = await this.model('mall_collect').where({type_id: typeId, value_id: valueId, user_id: userId}).limit(1).count('id');
    return hasCollect;
  }
};
