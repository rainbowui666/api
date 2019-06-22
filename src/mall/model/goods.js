module.exports = class extends think.Model {
  async getHotGoodsIds() {
    const totle = 'select goods_id ,count(1) count from mall_order_goods group by goods_id  order by count desc limit 4';
    const a = await this.query(totle);
    return a;
  }
};
