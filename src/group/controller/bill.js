const Base = require('./base.js');
const _ = require('lodash');
const moment = require('moment');

module.exports = class extends Base {
  async listAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const name = this.post('name') || '';

    const model = this.model('bill').alias('b');
    model.field(['b.*', 'u.name supplier_name']).join({
      table: 'user',
      join: 'inner',
      as: 'u',
      on: ['b.supplier_id', 'u.id']
    });
    const where = name ? {'b.name': ['like', `%${name}%`], 'b.is_one_step': 0} : {'b.is_one_step': 0};
    const list = await model.where(where).order(['b.effort_date DESC', 'b.id DESC']).page(page, size).countSelect();
    _.each(list.data, (item) => {
      const efDate = moment(item['effort_date']);
      if (efDate.isAfter(moment())) {
        item['status'] = 1;
      } else {
        item['status'] = 0;
      }
      item['effort_date'] = efDate.format(this.config('date_format'));
    });
    return this.json(list);
  }
  async getAction() {
    const id = this.post('billId');
    const model = this.model('bill');
    const bill = await model.where({id: id}).find();
    if (bill) {
      bill['effort_date_format'] = this.service('date', 'api').convertWebDateToSubmitDateTime(bill['effort_date']);
    }
    return this.json(bill);
  }
  async getCategoryListAction() {
    const billId = this.post('billId');
    const key = 'getCategoryListAction' + billId;
    const cacheList = await this.cache(key);
    if (cacheList) {
      this.json(cacheList);
    } else {
      const model = this.model('bill_detail').alias('d');
      model.field(['d.*']).join({
        table: 'material',
        join: 'inner',
        as: 'm',
        on: ['d.material_id', 'm.id']
      });
      const categoryList = await model.field('distinct m.category code').where({bill_id: billId}).select();
      const defineCategoryList = await this.controller('material', 'group').categoryAction();
      const result = _.intersectionBy(defineCategoryList, categoryList, 'code');
      const count = await this.model('bill_detail').where({bill_id: billId, material_id: 0}).count();
      if (count > 0) {
        result.push({'code': 'other', 'name': '未分类', 'desc': ''});
      }
      await this.cache(key, result, {
        timeout: 36 * 60 * 60 * 1000
      });
      this.json(result);
    }
  }

  async getDetailByIdAction() {
    const id = this.post('detailId');
    const detail = await this.model('bill_detail').where({id: id}).find();
    return this.json(detail);
  }
  async getDetailByBillIdAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const billId = this.post('billId');
    const key = 'getDetailByBillIdAction' + billId;
    const cacheList = await this.cache(key);
    if (cacheList) {
      this.json(cacheList);
    } else {
      const model = this.model('bill_detail');
      const whereMap = {};
      whereMap['bill_id'] = billId;
      if (!think.isEmpty(this.post('name'))) {
        whereMap['name'] = ['like', `%${this.post('name')}%`];
      }
      const list = await model.where(whereMap).page(page, size).countSelect();
      await this.cache(key, list, {
        timeout: 36 * 60 * 60 * 1000
      });
      this.json(list);
    }
  }
  async getDetailByBillIdAndCategoryAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const billId = this.post('billId');
    const cartId = this.post('cartId');
    const category = this.post('category');
    const key = 'getDetailByBillIdAndCategoryAction' + billId + page + size + category;
    const cacheList = await this.cache(key);
    // const cacheList = null;
    if (cacheList && cacheList.data) {
      const sumObjs = await this.model('cart_detail').field(['bill_detail_num', 'bill_detail_id']).where({'cart_id': cartId}).select() || [];
      for (const item of cacheList.data) {
        item.number = 0;
        for (const sumObj of sumObjs) {
          if (item.id === sumObj.bill_detail_id) {
            item.number = sumObj.bill_detail_num ? sumObj.bill_detail_num : 0;
          }
        }
      }
      // for (const item of cacheList.data) {
      //   const sumObj = await this.model('cart_detail').field(['bill_detail_num']).where({'cart_id': cartId, 'bill_detail_id': item.id}).find() || {};
      //   item.number = sumObj.bill_detail_num ? sumObj.bill_detail_num : 0;
      // }
      this.json(cacheList);
    } else {
      const model = this.model('bill_detail').alias('d');
      model.field(['d.*']).join({
        table: 'material',
        join: 'left',
        as: 'm',
        on: ['d.material_id', 'm.id']
      });
      const whereMap = {};
      whereMap['d.bill_id'] = this.post('billId');
      if (category === 'other') {
        whereMap['d.material_id'] = 0;
      } else if (!think.isEmpty(this.post('name'))) {
        whereMap['d.name'] = ['like', `%${this.post('name')}%`];
      } else {
        whereMap['m.category'] = category;
      }
      const order = this.post('priceOrder');
      let list = null;
      if (think.isEmpty(order)) {
        list = await model.where(whereMap).order(['d.recommend desc']).page(page, size).countSelect();
      } else {
        list = await model.where(whereMap).order(['d.price ' + order]).page(page, size).countSelect();
      }
      await this.cache(key, list, {
        timeout: 36 * 60 * 60 * 1000
      });
      if (list.data) {
        const sumObjs = await this.model('cart_detail').field(['bill_detail_num', 'bill_detail_id']).where({'cart_id': cartId}).select() || [];
        for (const item of list.data) {
          for (const sumObj of sumObjs) {
            item.number = 0;
            if (item.id === sumObj.bill_detail_id) {
              item.number = sumObj.bill_detail_num ? sumObj.bill_detail_num : 0;
            }
          }
        }
        // for (const item of list.data) {
        //   const sumObj = await this.model('cart_detail').field(['bill_detail_num']).where({'cart_id': cartId, 'bill_detail_id': item.id}).find() || {};
        //   item.number = sumObj.bill_detail_num ? sumObj.bill_detail_num : 0;
        // }
      }
      this.json(list);
    }
  }
  async getDetailsByBillIdAction() {
    const billId = this.post('billId');
    const cartId = this.post('cartId');
    const key = 'getDetailsByBillIdAction' + billId;
    const cacheList = await this.cache(key);
    if (cacheList) {
      const sumObjs = await this.model('cart_detail').field(['bill_detail_num', 'bill_detail_id']).where({'cart_id': cartId}).select() || [];
      for (const item of cacheList) {
        item.number = 0;
        for (const sumObj of sumObjs) {
          if (item.id === sumObj.bill_detail_id) {
            item.number = sumObj.bill_detail_num ? sumObj.bill_detail_num : 0;
          }
        }
      }
      this.json(cacheList);
    } else {
      const model = this.model('bill_detail').alias('d');
      model.field(['d.*']).join({
        table: 'material',
        join: 'left',
        as: 'm',
        on: ['d.material_id', 'm.id']
      });
      const whereMap = {};
      whereMap['d.bill_id'] = billId;
      const list = await model.where(whereMap).order(['d.recommend desc']).select();

      await this.cache(key, list, {
        timeout: 36 * 60 * 60 * 1000
      });
      if (list.length > 0) {
        const sumObjs = await this.model('cart_detail').field(['bill_detail_num', 'bill_detail_id']).where({'cart_id': cartId}).select() || [];
        for (const item of list) {
          item.number = 0;
          for (const sumObj of sumObjs) {
            if (item.id === sumObj.bill_detail_id) {
              item.number = sumObj.bill_detail_num ? sumObj.bill_detail_num : 0;
            }
          }
        }
      }
      this.json(list);
    }
  }
  async getDetailByBillIdAndTypeAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const model = this.model('bill_detail').alias('d');
    model.field(['d.*']).join({
      table: 'material',
      join: 'inner',
      as: 'm',
      on: ['d.material_id', 'm.id']
    });
    const list = await model.where({'m.type': this.post('type'), 'd.bill_id': this.post('billId')}).order(['d.recommend desc']).page(page, size).countSelect();
    this.json(list);
  }
  async getDetailByBillIdAndRecommendAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const model = this.model('bill_detail');
    const list = await model.where({'recommend': this.post('recommend'), 'bill_id': this.post('billId')}).order(['recommend desc']).page(page, size).countSelect();
    _.each(list, (item) => {
      if (item.recommend === 'tj') {
        item.recommend = '推荐';
      }
      if (item.recommend === 'tej') {
        item.recommend = '特价';
      }
    });
    this.json(list);
  }
  async getDetailRecommendByBillIdAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const model = this.model('bill_detail');
    const list = await model.where({'recommend': ['!=', ''], 'bill_id': this.post('billId')}).order(['recommend desc']).page(page, size).countSelect();
    _.each(list, (item) => {
      if (item.recommend === 'tj') {
        item.recommend = '推荐';
      }
      if (item.recommend === 'tej') {
        item.recommend = '特价';
      }
    });
    this.json(list);
  }
  async getDetailByBillIdAndUndefineAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const model = this.model('bill_detail');
    const list = await model.where({'material_id': 0, 'bill_id': this.post('billId')}).order(['recommend desc']).page(page, size).countSelect();
    this.json(list);
  }
};
