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
      const isPublish = this.post('isPublish');

      const coupon = {
        name,
        tag,
        description,
        price,
        isPublish,
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
    const isPublish = this.post('isPublish');

    const coupon = {
      name,
      tag,
      description,
      price,
      isPublish,
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
  async publishCouponAction() {
    const couponId = this.post('couponId');
    const userList = await this.model('user').where({openid: ['!=', null], phone: ['!=', '18888888888']}).select();
    var t = new Date();
    var iToDay = t.getDate();
    var iToMon = t.getMonth();
    var iToYear = t.getFullYear();
    var newDay = new Date(iToYear, iToMon, (iToDay + 7));
    for (const u of userList) {
      const coupon = {
        coupon_id: couponId,
        user_id: u.id,
        coupon_number: '1',
        used_time: newDay.getTime() / 1000,
        order_id: 0
      };
      await this.model('user_coupon').add(coupon);
    }
    return this.json('操作成功');
  }
};
