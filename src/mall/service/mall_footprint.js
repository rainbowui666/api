module.exports = class extends think.Service {
  async addFootprint(userId, goodsId) {
    // 用户已经登录才可以添加到足迹
    if (userId > 0 && goodsId > 0) {
      await this.model('mall_footprint').add({
        goods_id: goodsId,
        user_id: userId,
        add_time: parseInt(Date.now() / 1000)
      });
    }
  }
};
