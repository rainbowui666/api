const Base = require('./base.js');
const fs = require('fs');

module.exports = class extends Base {
  async downAction() {
    const id = this.post('id');
    await this.model('mall_goods').where({'brand_id': id}).update({'is_on_sale': 0});
    await this.model('mall_brand').where({id}).update({'is_show': 0});
  }
  async upAction() {
    const id = this.post('id');
    await this.model('mall_goods').where({'brand_id': id}).update({'is_on_sale': 1});
    await this.model('mall_brand').where({id}).update({'is_show': 1});
  }
  async deleteAction() {
    const goods = await this.model('mall_goods').where({brand_id: this.post('id')}).find();
    if (think.isEmpty(goods)) {
      const brand = await this.model('mall_brand').where({id: this.post('id')}).find();
      const picUrl = brand['pic_url'] ? brand['pic_url'].replace('https://static.huanjiaohu.com/image/brand/', '') : null;
      const listpicUrl = brand['list_pic_url'] ? brand['list_pic_url'].replace('https://static.huanjiaohu.com/image/brand/', '') : null;
      const apppicUrl = brand['app_list_pic_url'] ? brand['app_list_pic_url'].replace('https://static.huanjiaohu.com/image/brand/', '') : null;
      if (picUrl) {
        fs.unlinkSync(this.config('image.brand') + '/' + picUrl);
      }
      if (listpicUrl) {
        fs.unlinkSync(this.config('image.brand') + '/' + listpicUrl);
      }
      if (apppicUrl) {
        fs.unlinkSync(this.config('image.brand') + '/' + apppicUrl);
      }
      await this.model('mall_brand').where({id: this.post('id')}).delete();
      return this.success('操作成功');
    } else {
      return this.fail('请先删除该品牌下的商品');
    }
  }
  async addAction() {
    const name = this.post('name');
    const _brand = await this.model('mall_brand').where({name}).find();
    if (think.isEmpty(_brand)) {
      const brand = {
        'name': this.post('name'),
        'list_pic_url': this.post('list_pic_url'),
        'simple_desc': this.post('simple_desc'),
        'pic_url': this.post('pic_url'),
        'sort_order': this.post('sort_order'),
        'is_show': this.post('is_show'),
        'floor_price': this.post('floor_price'),
        'app_list_pic_url': this.post('app_list_pic_url'),
        'is_new': this.post('is_new'),
        'new_pic_url': this.post('new_pic_url'),
        'new_sort_order': this.post('new_sort_order')
      };
      const id = await this.model('mall_brand').add(brand);
      brand.id = id;
      this.json(brand);
    } else {
      this.fail('改名字品牌已经入驻');
    }
  }
  async updateAction() {
    const name = this.post('name');
    const _brand = await this.model('mall_brand').where({name}).find();
    if (think.isEmpty(_brand)) {
      const brand = {
        'name': this.post('name'),
        'list_pic_url': this.post('list_pic_url'),
        'simple_desc': this.post('simple_desc'),
        'pic_url': this.post('pic_url'),
        'sort_order': this.post('sort_order'),
        'is_show': this.post('is_show'),
        'floor_price': this.post('floor_price'),
        'app_list_pic_url': this.post('app_list_pic_url'),
        'is_new': this.post('is_new'),
        'new_pic_url': this.post('new_pic_url'),
        'new_sort_order': this.post('new_sort_order')
      };
      await this.model('mall_brand').where({id: this.post('id')}).update(brand);
      this.json(brand);
    } else {
      this.fail('改名字品牌已经入驻');
    }
  }
  async uploadPicAction() {
    const brandId = this.post('brandId');
    const img = this.file('img');
    const _name = img.name;
    const tempName = _name.split('.');
    let timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    const name = timestamp + '-' + brandId + '.' + tempName[1];
    const thumbUrl = this.config('image.brand') + '/' + name;
    const brand = await this.model('mall_brand').where({id: brandId}).find();
    if (!think.isEmpty(brand['pic_url'])) {
      fs.unlinkSync(this.config('image.brand') + '/' + brand['pic_url'].replace('https://static.huanjiaohu.com/image/brand/', ''));
    }
    fs.renameSync(img.path, thumbUrl);
    await this.model('mall_brand').where({id: brandId}).update({'pic_url': 'https://static.huanjiaohu.com/image/brand/' + name});
    this.success('操作成功');
  }
  async uploadListPicAction() {
    const brandId = this.post('brandId');
    const img = this.file('img');
    const _name = img.name;
    const tempName = _name.split('.');
    let timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    const name = timestamp + '-' + brandId + '.' + tempName[1];
    const thumbUrl = this.config('image.brand') + '/' + name;
    const brand = await this.model('mall_brand').where({id: brandId}).find();
    if (!think.isEmpty(brand['list_pic_url'])) {
      fs.unlinkSync(this.config('image.brand') + '/' + brand['list_pic_url'].replace('https://static.huanjiaohu.com/image/brand/', ''));
    }
    fs.renameSync(img.path, thumbUrl);
    await this.model('mall_brand').where({id: brandId}).update({'list_pic_url': 'https://static.huanjiaohu.com/image/brand/' + name});
    this.success('操作成功');
  }
  async uploadAppListPicAction() {
    const brandId = this.post('brandId');
    const img = this.file('img');
    const _name = img.name;
    const tempName = _name.split('.');
    let timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    const name = timestamp + '-' + brandId + '.' + tempName[1];
    const thumbUrl = this.config('image.brand') + '/' + name;
    const brand = await this.model('mall_brand').where({id: brandId}).find();
    if (!think.isEmpty(brand['app_list_pic_url'])) {
      fs.unlinkSync(this.config('image.brand') + '/' + brand['app_list_pic_url'].replace('https://static.huanjiaohu.com/image/brand/', ''));
    }
    fs.renameSync(img.path, thumbUrl);
    await this.model('mall_brand').where({id: brandId}).update({'app_list_pic_url': 'https://static.huanjiaohu.com/image/brand/' + name});
    this.success('操作成功');
  }
};
