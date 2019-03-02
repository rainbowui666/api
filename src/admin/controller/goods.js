const Base = require('./base.js');

module.exports = class extends Base {
  async addAction() {
    // const categoryId = this.post('categoryId');
    // const goodsSn = this.post('goodsSn');
    // const name = this.post('name');
    // const brandId = this.post('brandId');
    // const keywords = this.post('keywords');
    // const goodsBrief = this.post('goodsBrief');
    // const goodsDesc = this.file('goodsDesc');
    // const sortOrder = this.sortOrder('sortOrder');
    // const counterPrice = this.post('counterPrice');
    // const unitPrice = this.post('unitPrice');
    // const retailPrice = this.post('retailPrice');
    // const extraPrice = this.post('extraPrice');
    // const isNew = this.post('isNew');
    // const isHot = this.post('isHot');
    // const goodsUnit = this.post('goodsUnit');
    // const promotionDesc = this.post('promotionDesc');
    // const promotionTag = this.post('promotionTag');
    // const isLimited = this.post('isLimited');

    // const goods = {
    //   category_id: categoryId,
    //   goods_sn: goodsSn,
    //   name: name,
    //   brand_id: brandId,
    //   keywords: keywords,
    //   goods_brief: goodsBrief,
    //   sort_order: sortOrder,
    //   counter_price: counterPrice
    // };

    // category_id 分类
    // goods_sn  商品号
    // name     名字
    // brand_id  品牌
    // keywords  关键字
    // goods_brief 简介
    // goods_desc  描述
    // sort_order  排序
    // counter_price 柜台价
    // unit_price  单价
    // extra_price 手续费
    // is_new  是否最新
    // is_hot 是否人气
    // goods_unit 单位
    // retail_price 实际价格
    // primary_product_id 产品id
    // promotion_desc 促销描述
    // promotion_tag 促销标签
    // is_limited 限购
    const product = await this.model('mall_product').where({goods_sn: this.post('goodsName')}).find();
    if (think.isEmpty(product)) {
      const productObj = {
        goods_sn: this.post('goodsName'),
        goods_number: this.post('goodsNumber'),
        retail_price: this.post('retailPrice'),
        goods_specificaation_ids: this.post('goodsSpecificaationIds')
      };
      const id = await this.model('mall_product').add(productObj);
      this.success(id);
    } else {
      this.fail('该产品已经存在');
    }
  }

  async getTypeByCategoryIdAction() {
    const categoryId = this.post('categoryId');
    const types = await this.model('category').where({'parent_id': categoryId}).select();
    this.json(types);
  }

  async addProductAction() {
    const product = await this.model('mall_product').where({goods_sn: this.post('goodsName')}).find();
    if (think.isEmpty(product)) {
      const productObj = {
        goods_sn: this.post('goodsName'),
        goods_number: this.post('goodsNumber'),
        retail_price: this.post('retailPrice'),
        goods_specificaation_ids: this.post('goodsSpecificaationIds')
      };
      const id = await this.model('mall_product').add(productObj);
      this.success(id);
    } else {
      this.fail('该产品已经存在');
    }
  }

  async daleteProductAction() {
    const productId = this.post('productId');
    const product = await this.model('mall_product').where({id: productId}).find();
    const goods = await this.model('mall_goods').where({id: product.goods_id}).find();
    if (think.isEmpty(goods)) {
      const id = await this.model('mall_product').where({id: productId}).delete();
      this.success(id);
    } else {
      this.fail('请先删除名为' + goods.name + '的商品');
    }
  }

  async listProductAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 9;
    const products = await this.model('mall_product').order('id desc').page(page, size).countSelect();
    this.json(products);
  }

  async updateProductAction() {
    const productId = this.post('productId');
    const productObj = {
      goods_sn: this.post('goodsName'),
      goods_number: this.post('goodsNumber'),
      retail_price: this.post('retailPrice'),
      goods_specificaation_ids: this.post('goodsSpecificaationIds')
    };
    const id = await this.model('mall_product').where({id: productId}).update(productObj);
    this.success(id);
  }

  async getHotGoodsAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 9;
    const hotGoods = await this.model('mall_goods').where({is_hot: 1}).order('id desc').page(page, size).countSelect();
    this.json(hotGoods);
  }

  async getNewGoodsAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 9;
    const newGoods = await this.model('mall_goods').where({is_new: 1}).order('id desc').page(page, size).countSelect();
    this.json(newGoods);
  }

  async getGoodsCommentAction() {
    const goodsId = this.post('goodsId');
    const list = await this.controller('goods', 'mall').getGoodsCommentAction(goodsId);
    return this.json(list);
  }
  async detailAction() {
    const goodsId = this.post('goodsId');
    const goods = await this.controller('goods', 'mall').detailAction(goodsId);
    return this.json(goods);
  }

  async listAction() {
    const categoryId = this.post('categoryId');
    const brandId = this.post('brandId');
    const keyword = this.post('keyword');
    const isNew = this.post('isNew');
    const isHot = this.post('isHot');
    const page = this.post('page');
    const size = this.post('size');
    const sort = this.post('sort');
    const order = this.post('order');

    const goodsQuery = this.model('mall_goods');

    // 查询条件的map
    const whereMap = {is_delete: 0, is_on_sale: 1};
    if (!think.isEmpty(isNew)) {
      whereMap.is_new = isNew;
    }

    if (!think.isEmpty(isHot)) {
      whereMap.is_hot = isHot;
    }

    if (!think.isEmpty(keyword)) {
      whereMap.name = ['like', `%${keyword}%`];
      // 添加到搜索历史
      await this.model('mall_search_history').add({
        keyword: keyword,
        user_id: this.getLoginUserId(),
        add_time: parseInt(new Date().getTime() / 1000)
      });
    }

    if (!think.isEmpty(brandId)) {
      whereMap.brand_id = brandId;
    }

    // 排序
    let orderMap = {};
    if (sort === 'price') {
      // 按价格
      orderMap = {
        retail_price: order
      };
    } else {
      // 按商品添加时间
      orderMap = {
        id: 'desc'
      };
    }

    // 筛选的分类
    let filterCategory = [{
      'id': 0,
      'name': '全部',
      'checked': false
    }];

    const categoryIds = await goodsQuery.where(whereMap).getField('category_id', 10000);
    if (!think.isEmpty(categoryIds)) {
      // 查找二级分类的parent_id
      const parentIds = await this.model('category').where({id: {'in': categoryIds}}).getField('parent_id', 10000);
      // 一级分类
      const parentCategory = await this.model('category').field(['id', 'name']).order({'sort_order': 'asc'}).where({'id': {'in': parentIds}}).select();

      if (!think.isEmpty(parentCategory)) {
        filterCategory = filterCategory.concat(parentCategory);
      }
    }

    // 搜索到的商品
    const goodsData = await goodsQuery.where(whereMap).order(orderMap).page(page, size).countSelect();
    goodsData.filterCategory = filterCategory.map(function(v) {
      v.checked = (think.isEmpty(categoryId) && v.id === 0) || v.id === parseInt(categoryId);
      return v;
    });
    goodsData.goodsList = goodsData.data;

    return this.success(goodsData);
  }
};
