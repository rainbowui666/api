const Base = require('./base.js');

module.exports = class extends Base {
  async addAction() {
    const name = this.post('name');
    const couponObj = await this.model('coupon').where({name}).find();
    if (think.isEmpty(couponObj)) {
      const tag = this.post('tag');
      const description = this.post('description');
      const price = this.post('price');
      const priceCondition = this.post('priceCondition');
      const coupon = {
        name,
        tag,
        description,
        price,
        price_condition: priceCondition
      };
      const id = await this.model('coupon').add(coupon);
      coupon.id = id;
      this.json(coupon);
    } else {
      this.json('这个名字的优惠券已经有了');
    }
  }
  async updateAction() {
    const id = this.post('id');
    const name = this.post('name');
    const tag = this.post('tag');
    const description = this.post('description');
    const price = this.post('price');
    const priceCondition = this.post('priceCondition');
    const coupon = {
      name,
      tag,
      description,
      price,
      price_condition: priceCondition
    };
    const couponObj = await this.model('coupon').where({id}).update(coupon);
    this.json(couponObj);
  }
  async deleteAction() {
    const id = this.post('id');
    const couponObj = await this.model('user_coupon').where({coupon_id: id}).find();
    if (think.isEmpty(couponObj)) {
      await this.model('coupon').where({id}).delete();
    } else {
      this.fail('该优惠券正在使用');
    }
  }
  async listAction() {
    const couponObj = await this.model('coupon').select();
    for (const c of couponObj) {
      c['priceCondition'] = c['price_condition'];
    }
    this.json(couponObj);
  }
};
