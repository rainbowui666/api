const Base = require('./base.js');
const fs = require('fs');
const { loadImage, createCanvas, Image } = require('canvas');
const _ = require('lodash');
module.exports = class extends Base {
  async buildGoodsDescription(goodsId, img) {
    const imgPath = this.config('image.goods') + '/' + goodsId;
    if (fs.existsSync(imgPath)) {
      fs.rmdirSync(imgPath);
    }
    fs.mkdirSync(imgPath);

    const _name = img.name;
    const tempName = _name.split('.');
    let timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    const name = timestamp + '.' + tempName[1];
    const thumbUrl = imgPath + '/' + name;
    fs.renameSync(img.path, thumbUrl);
    const myimg = await loadImage(thumbUrl);
    const row = Math.ceil(myimg.height / 100);
    const column = 1;
    const wpiece = Math.floor(myimg.width / column);
    const hpiece = Math.floor(myimg.height / row);
    const canvas = createCanvas(myimg.width, myimg.height);
    const ctx = canvas.getContext('2d');
    canvas.width = wpiece;
    canvas.height = hpiece;
    let html = '<table  cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate; border-spacing:0px 0px;">';
    fs.readFile(thumbUrl, (err, squid) => {
      if (err) throw err;
      const imges = new Image();
      imges.onload = () => ctx.drawImage(imges, 0, 0);
      imges.onerror = err => { throw err };
      imges.src = squid;
      for (var i = 0; i < row; i++) {
        html += '<tr>';
        for (var j = 0; j < column; j++) {
          ctx.drawImage(
            imges,
            j * wpiece, i * hpiece, wpiece, hpiece,
            0, 0, wpiece, hpiece
          );
          const buf3 = canvas.toBuffer('image/jpeg', { quality: 0.9 });
          const timestamp = new Date().getTime();
          const name = _.uniqueId('goods') + timestamp + '.jpg';
          const path = imgPath + '/' + name;
          const url = 'https://static.huanjiaohu.com/image/goods/' + goodsId + '/' + name;
          fs.writeFileSync(path, buf3);
          html += '<td><img src="' + url + '" /></td>';
        }
        html += '</tr>';
      }
      html += '</table>';
      return html;
    });
  }

  async uploadDescAction() {
    const goodsId = this.post('goodsId');
    const img = this.file('img');
    const goodsDes = this.buildGoodsDescription(goodsId, img);
    const number = await this.model('mall_goods').where({id: goodsId}).update({goods_desc: goodsDes});
    return this.success(number);
  }

  async addAction() {
    const name = this.post('name');
    const goods = await this.model('mall_goods').where({name}).find();
    if (think.isEmpty(goods)) {
      const categoryId = this.post('categoryId');
      const goodsSn = this.post('goodsSn');
      const brandId = this.post('brandId');
      const keywords = this.post('keywords');
      const goodsBrief = this.post('goodsBrief');
      const sortOrder = this.sortOrder('sortOrder');
      const counterPrice = this.post('counterPrice');
      const unitPrice = this.post('unitPrice');
      const retailPrice = this.post('retailPrice');
      const extraPrice = this.post('extraPrice');
      const isNew = this.post('isNew');
      const isHot = this.post('isHot');
      const goodsUnit = this.post('goodsUnit');
      const promotionDesc = this.post('promotionDesc');
      const promotionTag = this.post('promotionTag');
      const isLimited = this.post('isLimited');

      const goods = {
        category_id: categoryId,
        goods_sn: goodsSn,
        name: name,
        brand_id: brandId,
        keywords: keywords,
        goods_brief: goodsBrief,
        sort_order: sortOrder,
        counter_price: counterPrice,
        unit_price: unitPrice,
        extra_price: extraPrice,
        is_new: isNew,
        is_hot: isHot,
        goods_unit: goodsUnit,
        retail_price: retailPrice,
        promotion_desc: promotionDesc,
        promotion_tag: promotionTag,
        is_limited: isLimited
      };
      const id = await this.model('mall_goods').add(goods);
      goods.id = id;
      this.json(goods);
    } else {
      this.fail('该商品已经存在');
    }
  }

  async updateAction() {
    const id = this.post('goodsId');
    const categoryId = this.post('categoryId');
    const name = this.post('name');
    const goodsSn = this.post('goodsSn');
    const brandId = this.post('brandId');
    const keywords = this.post('keywords');
    const goodsBrief = this.post('goodsBrief');
    const sortOrder = this.sortOrder('sortOrder');
    const counterPrice = this.post('counterPrice');
    const unitPrice = this.post('unitPrice');
    const retailPrice = this.post('retailPrice');
    const extraPrice = this.post('extraPrice');
    const isNew = this.post('isNew');
    const isHot = this.post('isHot');
    const goodsUnit = this.post('goodsUnit');
    const promotionDesc = this.post('promotionDesc');
    const promotionTag = this.post('promotionTag');
    const isLimited = this.post('isLimited');

    const goods = {
      category_id: categoryId,
      goods_sn: goodsSn,
      name: name,
      brand_id: brandId,
      keywords: keywords,
      goods_brief: goodsBrief,
      sort_order: sortOrder,
      counter_price: counterPrice,
      unit_price: unitPrice,
      extra_price: extraPrice,
      is_new: isNew,
      is_hot: isHot,
      goods_unit: goodsUnit,
      retail_price: retailPrice,
      promotion_desc: promotionDesc,
      promotion_tag: promotionTag,
      is_limited: isLimited
    };
    await this.model('mall_goods').where({id}).update(goods);
    this.json(goods);
  }

  async getTypeByCategoryIdAction() {
    const categoryId = this.post('categoryId');
    const types = await this.model('category').where({'parent_id': categoryId}).select();
    this.json(types);
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
