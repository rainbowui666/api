const Base = require('./base.js');

module.exports = class extends Base {
  async deleteAction() {
    await this.model('mall_goods').where({brand_id: this.post('id')}).delete();
    await this.model('mall_brand').where({id: this.post('id')}).delete();
    return this.success('操作成功');
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
};
