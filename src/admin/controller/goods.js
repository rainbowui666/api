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
    let html = '<table  cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate; border-spacing:0px 0px;font-size: 0">';
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
      const sortOrder = this.post('sortOrder');
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

  async getSpecificationAction() {
    const list = await this.model('mall_specification').select();
    return this.json(list);
  }
  async deleteGoodsSpecificationAction() {
    const id = this.post('id');
    const gs = await this.model('mall_goods_specification').where({id}).find();
    const list = await this.model('mall_product').where({goods_id: gs.goods_id}).select();
    const ids = new Set();
    if (list && list.length > 0) {
      for (const item of list) {
        const iids = item.goods_specification_ids.split('_');
        for (const id of iids) {
          ids.add(id);
        }
      }
    }
    if (ids.has(id)) {
      return this.fail('请先删除改规格的产品定义');
    } else {
      const imgPath = this.config('image.goods') + '/specification/' + gs.goods_id;
      if (gs['pic_url']) {
        const filePath = imgPath + '/' + gs['pic_url'].replace('https://static.huanjiaohu.com/image/goods/specification/' + gs.goods_id + '/', '');
        fs.unlinkSync(filePath);
      }
      const number = await this.model('mall_goods_specification').where({id}).delete();
      return this.json(number);
    }
  }
  async getGoodsSpecificationAction() {
    const goodsId = this.post('goodsId');
    const specificationId = this.post('specificationId');
    const list = await this.model('mall_goods_specification').alias('s').field(['s.*', 'g.name'])
      .join({
        table: 'goods',
        join: 'inner',
        as: 'g',
        on: ['g.id', 's.goods_id']
      }).where({'s.goods_id': goodsId, 's.specification_id': specificationId}).select();
    return this.json(list);
  }
  async addGoodsSpecificationAction() {
    const goodsId = this.post('goodsId');
    const specificationId = this.post('specificationId');
    const value = this.post('value');
    const obj = {
      goods_id: goodsId,
      specification_id: specificationId,
      value
    };
    const id = await this.model('mall_goods_specification').add(obj);
    obj.id = id;
    return this.json(obj);
  }
  async updateGoodsSpecificationAction() {
    const id = this.post('id');
    const value = this.post('value');
    const number = await this.model('mall_goods_specification').where({id}).update({value});
    return this.json(number);
  }
  async uploadGoodsSpecificationAction() {
    const id = this.post('id');
    const goodsId = this.post('goodsId');
    const img = this.file('img');
    const imgPath = this.config('image.goods') + '/specification/' + goodsId;
    if (!fs.existsSync(imgPath)) {
      fs.mkdirSync(imgPath);
    }
    const gs = await this.model('mall_goods_specification').where({id}).find();
    if (gs['pic_url']) {
      const filePath = imgPath + '/' + gs['pic_url'].replace('https://static.huanjiaohu.com/image/goods/specification/' + goodsId + '/', '');
      fs.unlinkSync(filePath);
    }
    const _name = img.name;
    const tempName = _name.split('.');
    let timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    const name = timestamp + '.' + tempName[1];
    const thumbUrl = imgPath + '/' + name;
    fs.renameSync(img.path, thumbUrl);
    const url = 'https://static.huanjiaohu.com/image/goods/specification/' + goodsId + '/' + name;
    const number = await this.model('mall_goods_specification').where({id}).update({'pic_url': url});
    return this.json(number);
  }
  async addGoodsProductAction() {
    const goodsId = this.post('goodsId');
    const goodsSpecificationIds = this.post('goodsSpecificationIds');
    const goodsNmuber = this.post('goodsNmuber');
    const retailPrice = this.post('retailPrice');
    const obj = {
      goods_id: goodsId,
      goods_specification_ids: goodsSpecificationIds,
      goods_nmuber: goodsNmuber,
      retail_price: retailPrice
    };
    const id = await this.model('mall_product').add(obj);
    obj.id = id;
    return this.json(obj);
  }

  async deleteGoodsProductAction() {
    const id = this.post('id');
    const number = await this.model('mall_product').where({id}).delete();
    return this.json(number);
  }

  async updateGoodsProductAction() {
    const id = this.post('id');
    const goodsSpecificationIds = this.post('goodsSpecificationIds');
    const goodsNmuber = this.post('goodsNmuber');
    const retailPrice = this.post('retailPrice');
    const obj = {
      goods_specification_ids: goodsSpecificationIds,
      goods_nmuber: goodsNmuber,
      retail_price: retailPrice
    };
    const number = await this.model('mall_product').where({id}).update(obj);
    return this.json(number);
  }

  async getGoodsProductAction() {
    const goodsId = this.post('goodsId');
    const list = await this.model('mall_product').alias('s').field(['s.*', 'g.name'])
      .join({
        table: 'goods',
        join: 'inner',
        as: 'g',
        on: ['g.id', 's.goods_id']
      }).where({'s.goods_id': goodsId}).select();
    return this.json(list);
  }

  async getAttributeCategoryAction() {
    const list = await this.model('mall_attribute_category').select();
    return this.json(list);
  }

  async getAttributeByCategoryIdAction() {
    const categoryId = this.post('categoryId');
    const list = await this.model('mall_attribute').where({attribute_category_id: categoryId}).select();
    return this.json(list);
  }

  async addGoodsAttributeAction() {
    const goodsId = this.post('goodsId');
    const value = this.post('value');
    const attributeId = this.post('attributeId');
    const obj = {
      goods_id: goodsId,
      value: value,
      attribute_id: attributeId
    };
    const id = await this.model('mall_goods_attribute').add(obj);
    obj.id = id;
    return this.json(obj);
  }
  async deleteGoodsAttributeAction() {
    const id = this.post('id');
    const number = await this.model('mall_goods_attribute').where({id}).delete();
    return this.json(number);
  }
  async updateGoodsAttributeAction() {
    const id = this.post('id');
    const value = this.post('value');
    const attributeId = this.post('attributeId');
    const obj = {
      value: value,
      attribute_id: attributeId
    };
    const number = await this.model('mall_goods_attribute').where({id}).update(obj);
    return this.json(number);
  }
  async getGoodsAttributeAction() {
    const goodsId = this.post('goodsId');
    const list = await this.model('mall_goods_attribute').alias('s').field(['s.*', 'g.name'])
      .join({
        table: 'goods',
        join: 'inner',
        as: 'g',
        on: ['g.id', 's.goods_id']
      }).where({'s.goods_id': goodsId}).select();
    return this.json(list);
  }

  async addGoodsIssueAction() {
    const goodsId = this.post('goodsId');
    const question = this.post('question');
    const answer = this.post('answer');
    const obj = {
      goods_id: goodsId,
      answer: answer,
      question: question
    };
    const id = await this.model('mall_goods_issue').add(obj);
    obj.id = id;
    return this.json(obj);
  }
  async deleteGoodsIssueAction() {
    const id = this.post('id');
    const number = await this.model('mall_goods_issue').where({id}).delete();
    return this.json(number);
  }
  async updateGoodsIssueAction() {
    const id = this.post('id');
    const question = this.post('question');
    const answer = this.post('answer');
    const obj = {
      answer: answer,
      question: question
    };
    const number = await this.model('mall_goods_issue').where({id}).update(obj);
    return this.json(number);
  }
  async getGoodsIssueAction() {
    const goodsId = this.post('goodsId');
    const list = await this.model('mall_goods_issue').alias('s').field(['s.*', 'g.name'])
      .join({
        table: 'goods',
        join: 'inner',
        as: 'g',
        on: ['g.id', 's.goods_id']
      }).where({'s.goods_id': goodsId}).select();
    return this.json(list);
  }

  async addGoodsGalleryAction() {
    const goodsId = this.post('goodsId');
    const imgDesc = this.post('imgDesc');
    const sortOrder = this.post('sortOrder');
    const obj = {
      goods_id: goodsId,
      img_desc: imgDesc,
      sort_order: sortOrder
    };
    const id = await this.model('mall_goods_gallery').add(obj);
    obj.id = id;
    return this.json(obj);
  }
  async uploadGoodsGalleryAction() {
    const goodsId = this.post('goodsId');
    const imgDesc = this.post('imgDesc');
    const sortOrder = this.post('sortOrder');
    const obj = {
      goods_id: goodsId,
      img_desc: imgDesc,
      sort_order: sortOrder
    };
    const galleryId = await this.model('mall_goods_gallery').add(obj);
    obj.id = galleryId;
    const img = this.file('img');
    const imgPath = this.config('image.goods') + '/gallery/' + goodsId;
    if (!fs.existsSync(imgPath)) {
      fs.mkdirSync(imgPath);
    }
    const _name = img.name;
    const tempName = _name.split('.');
    let timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    const name = timestamp + '.' + tempName[1];
    const thumbUrl = imgPath + '/' + name;
    fs.renameSync(img.path, thumbUrl);
    const url = 'https://static.huanjiaohu.com/image/goods/gallery/' + goodsId + '/' + name;
    const number = await this.model('mall_goods_gallery').where({id: galleryId}).update({'img_url': url});
    return this.json(number);
  }
  async deleteGoodsGalleryAction() {
    const id = this.post('id');
    const gs = await this.model('mall_goods_gallery').where({id}).find();
    const imgPath = this.config('image.goods') + '/gallery/' + gs.goodsId;
    if (gs['img_url']) {
      const filePath = imgPath + '/' + gs['img_url'].replace('https://static.huanjiaohu.com/image/goods/gallery/' + gs.goodsId + '/', '');
      fs.unlinkSync(filePath);
    }
    const number = await this.model('mall_goods_gallery').where({id}).delete();
    return this.json(number);
  }
  async updateGoodsGalleryAction() {
    const id = this.post('id');
    const imgDesc = this.post('imgDesc');
    const sortOrder = this.post('sortOrder');
    const obj = {
      img_desc: imgDesc,
      sort_order: sortOrder
    };
    const number = await this.model('mall_goods_gallery').where({id}).update(obj);
    return this.json(number);
  }
  async getGoodsGalleryAction() {
    const goodsId = this.post('goodsId');
    const list = await this.model('mall_goods_gallery').alias('s').field(['s.*', 'g.name'])
      .join({
        table: 'goods',
        join: 'inner',
        as: 'g',
        on: ['g.id', 's.goods_id']
      }).where({'s.goods_id': goodsId}).select();
    return this.json(list);
  }
};
