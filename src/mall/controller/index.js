const Base = require('./base.js');

module.exports = class extends Base {
  async indexAction() {
    const banner = await this.model('mall_ad').where({ad_position_id: 1}).select();
    // const channel = await this.model('mall_channel').order({sort_order: 'asc'}).select();
    const newGoods = await this.model('mall_goods').field(['id', 'name', 'list_pic_url', 'retail_price']).where({is_new: 1, is_on_sale: 1}).limit(4).order('id desc').select();
    const where = {is_on_sale: 1};
    const goods = await this.model('mall_order_goods').field(['goods_id']).limit(4).order('id desc').select();
    const ids = [];
    for (const good of goods) {
      ids.push(good.goods_id);
    }
    where.id = ['IN', ids];
    const hotGoods = await this.model('mall_goods').field(['id', 'name', 'list_pic_url', 'retail_price', 'goods_brief']).where(where).limit(4).select();
    const brandList = await this.model('mall_brand').where({is_new: 1}).order({new_sort_order: 'asc'}).limit(4).select();
    // const topicList = await this.model('mall_topic').limit(3).select();

    const categoryList = await this.model('category').where('id = 1011000 OR id = 1012000').select();
    const newCategoryList = [];
    for (const categoryItem of categoryList) {
      const childCategoryIds = await this.model('category').where({parent_id: categoryItem.id}).getField('id', 100);
      const categoryGoods = await this.model('mall_goods').field(['id', 'name', 'list_pic_url', 'retail_price']).where({category_id: ['IN', childCategoryIds], is_on_sale: 1}).order('sort_order desc').limit(7).select();
      newCategoryList.push({
        id: categoryItem.id,
        name: categoryItem.name,
        goodsList: categoryGoods
      });
    }

    return this.success({
      banner: banner,
      // channel: channel,
      newGoodsList: newGoods,
      hotGoodsList: hotGoods.reverse(),
      brandList: brandList,
      // topicList: topicList,
      categoryList: newCategoryList
    });
  }
};
