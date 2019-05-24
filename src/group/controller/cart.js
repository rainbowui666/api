const Base = require('./base.js');
const moment = require('moment');
const _ = require('lodash');

module.exports = class extends Base {
  async lostAddAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const billDetailNum = this.post('billDetailNum');
    const cartDetail = await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).find();
    const lostNum = cartDetail.lost_num - 1;
    const billDetail = await this.model('bill_detail').where({id: billDetailId}).find();
    const groupDetail = await this.model('cart').alias('c').field(['g.*', 'c.lost_back']).join({
      table: 'group_bill',
      join: 'inner',
      as: 'g',
      on: ['c.group_bill_id', 'g.id']
    }).where({'c.id': cartId}).find();
    const tempFreight = billDetail.price * groupDetail.freight;
    let backFreight = null;
    if (Number(groupDetail.top_freight) === 0) {
      backFreight = tempFreight;
    } else {
      backFreight = tempFreight > groupDetail.top_freight ? groupDetail.top_freight : tempFreight;
    }
    let lostBack = groupDetail.lost_back - billDetail.price - backFreight;
    lostBack = lostBack > groupDetail.sum ? groupDetail.sum : lostBack;
    const lostBackFreight = cartDetail.lost_back_freight - backFreight;

    await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({'lost_num': lostNum, 'bill_detail_num': billDetailNum, 'lost_back_freight': lostBackFreight});
    await this.model('cart').where({id: cartId}).update({'lost_back': lostBack});

    const sumObj = await this.model('cart').field(['sum(sum) sum', 'count(1) cartCount', 'sum(damage_back) damage_back', 'sum(lost_back) lost_back']).where({'group_bill_id': groupDetail.id, 'is_confirm': 1}).find();
    const detailCountSql = `select sum(bill_detail_num) - sum(lost_num) - sum(damage_num) detailCount,sum(lost_num) lost_num,sum(damage_num) damage_num from cart_detail where cart_id in (select u.id from (select c.id from cart c where c.group_bill_id=${groupDetail.id}) u)`;
    const detailCount = await this.model().query(detailCountSql);
    groupDetail['lost_num'] = detailCount[0].lost_num || 0;
    groupDetail['damage_num'] = detailCount[0].damage_num || 0;
    groupDetail['damage_back'] = sumObj.damage_back || 0;
    groupDetail['lost_back'] = sumObj.lost_back || 0;

    this.success(groupDetail);
  }
  async lostSubAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const billDetailNum = this.post('billDetailNum');
    const cartDetail = await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).find();
    const lostNum = cartDetail.lost_num + 1;
    const billDetail = await this.model('bill_detail').where({id: billDetailId}).find();
    const groupDetail = await this.model('cart').alias('c').field(['g.*', 'c.lost_back']).join({
      table: 'group_bill',
      join: 'inner',
      as: 'g',
      on: ['c.group_bill_id', 'g.id']
    }).where({'c.id': cartId}).find();
    const tempFreight = billDetail.price * groupDetail.freight;
    let backFreight = null;
    if (Number(groupDetail.top_freight) === 0) {
      backFreight = tempFreight;
    } else {
      backFreight = tempFreight > groupDetail.top_freight ? groupDetail.top_freight : tempFreight;
    }

    let lostBack = billDetail.price + groupDetail.lost_back + backFreight;
    lostBack = lostBack < 0 ? 0 : lostBack;
    const lostBackFreight = cartDetail.lost_back_freight + backFreight;

    await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({'lost_num': lostNum, 'bill_detail_num': billDetailNum, 'lost_back_freight': lostBackFreight});
    await this.model('cart').where({id: cartId}).update({'lost_back': lostBack});
    const sumObj = await this.model('cart').field(['sum(sum) sum', 'count(1) cartCount', 'sum(damage_back) damage_back', 'sum(lost_back) lost_back']).where({'group_bill_id': groupDetail.id, 'is_confirm': 1}).find();
    const detailCountSql = `select sum(bill_detail_num) - sum(lost_num) - sum(damage_num) detailCount,sum(lost_num) lost_num,sum(damage_num) damage_num from cart_detail where cart_id in (select u.id from (select c.id from cart c where c.group_bill_id=${groupDetail.id}) u)`;
    const detailCount = await this.model().query(detailCountSql);
    groupDetail['lost_num'] = detailCount[0].lost_num || 0;
    groupDetail['damage_num'] = detailCount[0].damage_num || 0;
    groupDetail['damage_back'] = sumObj.damage_back || 0;
    groupDetail['lost_back'] = sumObj.lost_back || 0;

    this.success(groupDetail);
  }
  async damageAddAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const billDetailNum = this.post('billDetailNum');
    const cartDetail = await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).find();
    const damageNum = cartDetail.damage_num - 1;
    await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({'damage_num': damageNum, 'bill_detail_num': billDetailNum});
    const billDetail = await this.model('bill_detail').where({id: billDetailId}).find();
    const cart = await this.model('cart').where({id: cartId}).find();
    const damageBack = cart.damage_back - billDetail.price;
    await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({'damage_num': damageNum, 'bill_detail_num': billDetailNum, 'damage_back_freight': 0});
    await this.model('cart').where({id: cartId}).update({'damage_back': damageBack});

    const groupDetail = await this.model('cart').alias('c').field(['g.*', 'c.lost_back']).join({
      table: 'group_bill',
      join: 'inner',
      as: 'g',
      on: ['c.group_bill_id', 'g.id']
    }).where({'c.id': cartId}).find();
    const sumObj = await this.model('cart').field(['sum(sum) sum', 'count(1) cartCount', 'sum(damage_back) damage_back', 'sum(lost_back) lost_back']).where({'group_bill_id': groupDetail.id, 'is_confirm': 1}).find();
    const detailCountSql = `select sum(bill_detail_num) - sum(lost_num) - sum(damage_num) detailCount,sum(lost_num) lost_num,sum(damage_num) damage_num from cart_detail where cart_id in (select u.id from (select c.id from cart c where c.group_bill_id=${groupDetail.id}) u)`;
    const detailCount = await this.model().query(detailCountSql);
    groupDetail['lost_num'] = detailCount[0].lost_num || 0;
    groupDetail['damage_num'] = detailCount[0].damage_num || 0;
    groupDetail['damage_back'] = sumObj.damage_back || 0;
    groupDetail['lost_back'] = sumObj.lost_back || 0;

    this.success(groupDetail);
  }
  async damageSubAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const billDetailNum = this.post('billDetailNum');
    const cartDetail = await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).find();
    const damageNum = cartDetail.damage_num + 1;
    const billDetail = await this.model('bill_detail').where({id: billDetailId}).find();
    const cart = await this.model('cart').where({id: cartId}).find();
    let damageBack = billDetail.price + cart.damage_back;
    damageBack = damageBack < 0 ? 0 : damageBack;

    await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({'damage_num': damageNum, 'bill_detail_num': billDetailNum, 'damage_back_freight': 0});
    await this.model('cart').where({id: cartId}).update({'damage_back': damageBack});

    const groupDetail = await this.model('cart').alias('c').field(['g.*', 'c.lost_back']).join({
      table: 'group_bill',
      join: 'inner',
      as: 'g',
      on: ['c.group_bill_id', 'g.id']
    }).where({'c.id': cartId}).find();
    const sumObj = await this.model('cart').field(['sum(sum) sum', 'count(1) cartCount', 'sum(damage_back) damage_back', 'sum(lost_back) lost_back']).where({'group_bill_id': groupDetail.id, 'is_confirm': 1}).find();
    const detailCountSql = `select sum(bill_detail_num) - sum(lost_num) - sum(damage_num) detailCount,sum(lost_num) lost_num,sum(damage_num) damage_num from cart_detail where cart_id in (select u.id from (select c.id from cart c where c.group_bill_id=${groupDetail.id}) u)`;
    const detailCount = await this.model().query(detailCountSql);
    groupDetail['lost_num'] = detailCount[0].lost_num || 0;
    groupDetail['damage_num'] = detailCount[0].damage_num || 0;
    groupDetail['damage_back'] = sumObj.damage_back || 0;
    groupDetail['lost_back'] = sumObj.lost_back || 0;

    this.success(groupDetail);
  }
  async deleteAction(_cartId) {
    const cartId = _cartId || this.post('cartId');
    const cart = await this.model('cart').where({id: this.post('cartId')}).find();
    if (think.isEmpty(cart)) {
      this.fail('请先创建购物车');
    } else {
      await this.model('cart_detail').where({cart_id: cartId}).delete();
      await this.model('cart').where({id: cartId}).delete();
      this.success(true);
    }
  }
  async deleteDetailAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const cart = await this.model('cart').where({id: this.post('cartId')}).find();
    if (think.isEmpty(cart)) {
      this.fail('请先创建购物车');
    } else {
      const group = await this.model('group_bill').where({id: cart.group_bill_id}).find();
      if (!moment(group.end_date).isAfter(moment())) {
        this.fail('团购已经结束不能操作购物车');
      } else if (Number(group.status) === 0) {
        this.fail('团购已经结束不能操作购物车');
      } else {
        await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).delete();
        const cart = {
          sum: this.post('sum'),
          freight: this.post('freight')
        };
        if (Number(this.post('sum')) === 0) {
          cart['is_confirm'] = 0;
        }
        await this.model('cart').where({id: cartId}).update(cart);
        this.success(true);
      }
    }
  }
  async getCurrentCartByGroupIdAction() {
    const userId = this.getLoginUserId();
    const groupBillId = this.post('groupId');
    const cart = await this.model('cart').where({'group_bill_id': groupBillId, 'user_id': userId}).find();
    if (think.isEmpty(cart)) {
      const user = await this.model('user').where({id: userId}).find();
      const cartId = await this.model('cart').add({
        group_bill_id: groupBillId,
        user_id: userId,
        phone: user.phone,
        status: 1
      });
      cart.id = cartId;
    }
    const sumObj = await this.model('cart_detail').field(['sum(sum) sum', 'sum(freight) freight', 'sum(bill_detail_num) cartCount']).where({'cart_id': cart.id}).find();
    if (!think.isEmpty(sumObj.cartCount)) {
      await this.model('cart').where({'id': cart.id}).update({
        sum: sumObj.sum,
        freight: sumObj.freight
      });
      cart.cartCount = sumObj.cartCount;
      cart.sum = sumObj.sum;
      cart.freight = sumObj.freight;
    } else {
      cart.cartCount = 0;
      cart.sum = 0;
      cart.freight = 0;
    }
    return this.json(cart);
  }
  async getByGroupIdAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const userId = this.getLoginUserId();
    const groupBillId = this.post('groupId');
    const cart = await this.model('cart').where({'group_bill_id': groupBillId, 'user_id': userId}).page(page, size).countSelect();
    this.json(cart);
  }
  async addAction() {
    const userId = this.getLoginUserId();
    const groupBillId = this.post('groupId');
    const cart = await this.model('cart').field('count(1) count').where({user_id: userId, group_bill_id: groupBillId}).find();
    if (cart.count !== 0) {
      this.fail('购物车已经存在');
    } else {
      const user = await this.model('user').where({id: userId}).find();
      const cartId = await this.model('cart').add({
        group_bill_id: groupBillId,
        user_id: userId,
        phone: user.phone,
        status: 1
      });
      const cart = await this.model('cart').where({id: cartId}).find();
      this.json(cart);
    }
  }
  async updatePayAction() {
    const cart = await this.model('cart').where({id: this.post('cartId')}).find();
    if (think.isEmpty(cart)) {
      this.fail('请先创建购物车');
    } else {
      if (Number(cart['isConfirm']) === 0) {
        this.fail('鱼友未确认购物车');
      } else {
        await this.model('cart').where({id: this.post('cartId')}).update({
          is_pay: this.post('isPay')
        });
        this.success(true);
      }
    }
  }
  async updateAction() {
    const phone = this.post('phone');
    const cart = await this.model('cart').where({id: this.post('cartId')}).find();
    if (think.isEmpty(cart)) {
      this.fail('请先创建购物车');
    } else if (phone && phone === '18888888888') {
      this.fail('请输入正确的手机号');
    } else {
      const group = await this.model('group_bill').where({id: cart.group_bill_id}).find();
      if (!moment(group.end_date).isAfter(moment())) {
        this.fail('团购已经结束不能操作购物车');
      } else if (Number(group.status) === 0) {
        this.fail('团购已经结束不能操作购物车');
      } else {
        if (Number(this.post('sum')) === 0 && Number(this.post('isConfirm')) === 1) {
          this.fail('确认时购物车不能为空');
        } else {
          const updateCart = {
            is_pay: this.post('isPay'),
            sum: this.post('sum'),
            description: this.post('description'),
            status: this.post('status'),
            freight: this.post('freight'),
            contacts: this.post('contacts'),
            address: this.post('address'),
            province: this.post('province'),
            city: this.post('city'),
            phone: phone,
            is_confirm: this.post('isConfirm')
          };
          await this.model('cart').where({id: this.post('cartId')}).update(updateCart);
          const cityObj = await this.controller('tools', 'api').getCityByPhoneAction(phone);
          if (cityObj) {
            const userId = this.getLoginUserId();
            this.model('user').where({ 'id': userId }).update({phone: phone, city: cityObj.mark, province: cityObj.area, city_name: cityObj.city, province_name: cityObj.province});
          }
          this.success(true);
        }
      }
    }
  }
  async listByStatusAction() {
    // const page = this.post('page') || 1;
    // const size = this.post('size') || 10;
    // const isConfirm = this.post('isConfirm');
    // const isPay = this.post('isPay');
    const status = this.post('status');
    const userId = this.getLoginUserId();
    const model = this.model('cart').alias('c');
    model.field(['c.*', 'u.type group_user_type', 'g.id group_id', 'u.city_name', 'g.activity_code', 'date_format(g.end_date, \'%m-%d %H:%i\') end_date_format', 'date_format(c.insert_date, \'%m-%d %H:%i\') insert_date_format', 'g.name group_name', 'g.status group_status', 'g.contacts group_user_name', 'g.user_id group_user_id'])
      .join({
        table: 'group_bill',
        join: 'inner',
        as: 'g',
        on: ['c.group_bill_id', 'g.id']
      })
      .join({
        table: 'user',
        join: 'inner',
        as: 'u',
        on: ['g.user_id', 'u.id']
      });
    const list = await model.where({'g.status': status, 'c.user_id': userId, 'sum': ['!=', 0]}).order(['g.end_date desc']).select();
    _.each(list, (group) => {
      group['total'] = Number(group['sum']) + Number(group['freight']) - Number(group['lost_back']) - Number(group['damage_back']);
      if (group['group_user_type'] === 'lss') {
        group['is_group'] = false;
      } else {
        group['is_group'] = true;
      }
      group.headimgurl = think.config('root_api') + '/user/getAvatar?userId=' + group.group_user_id;
      group.navigator_url = '/pages/group/buy?id=' + group.group_id;
      if (group.group_status === 0) {
        group.tag = ['已结束'];
      } else {
        if (group.is_pay === 0) {
          group.tag = ['未付款'];
        } else {
          group.tag = ['已付款'];
        }
      }

      group.time = group.end_date_format;
      group.title = group.group_name;
      group.name = group.group_user_name;
      group.city_name = group.city_name;
      group.price = group.total;
      delete group.description;
    });
    this.json(list);
    return list;
  }

  async listAction(_userId) {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const userId = _userId || (this.post('userId') ? this.post('userId') : this.getLoginUserId());
    const model = this.model('cart').alias('c');
    model.field(['c.*', 'u.type group_user_type', 'date_format(c.insert_date, \'%Y-%m-%d %H:%i\') insert_date_format', 'g.name group_name', 'g.status group_status', 'g.contacts group_user_name', 'g.user_id group_user_id'])
      .join({
        table: 'group_bill',
        join: 'inner',
        as: 'g',
        on: ['c.group_bill_id', 'g.id']
      })
      .join({
        table: 'user',
        join: 'inner',
        as: 'u',
        on: ['g.user_id', 'u.id']
      });
    const list = await model.where({'c.user_id': userId, 'is_confirm': 1, 'sum': ['!=', 0]}).order(['c.id DESC']).page(page, size).countSelect();
    _.each(list.data, (item) => {
      item['total'] = Number(item['sum']) + Number(item['freight']) - Number(item['lost_back']) - Number(item['damage_back']);
      if (item['group_user_type'] === 'lss') {
        item['is_group'] = false;
      } else {
        item['is_group'] = true;
      }
    });
    this.json(list);
    return list;
  }

  async listByGroupIdAction() {
    const groupId = this.post('groupId');
    const model = this.model('cart').alias('c');
    model.field(['c.*', 'g.name group_name', 'g.status group_status', 'g.activity_code', 'u.name user_name', 'u.city_name', 'u.type user_type']).join({
      table: 'group_bill',
      join: 'inner',
      as: 'g',
      on: ['c.group_bill_id', 'g.id']
    }).join({
      table: 'user',
      join: 'inner',
      as: 'u',
      on: ['c.user_id', 'u.id']
    });
    const list = await model.where({'c.group_bill_id': groupId, 'c.is_confirm': 1, 'c.sum': ['!=', 0]}).order(['c.id DESC']).select();
    _.each(list, (item) => {
      item['total'] = Number(item['sum']) + Number(item['freight']) - Number(item['lost_back']) - Number(item['damage_back']);
      if (item['user_type'] === 'lss' || item['user_type'] === 'lss') {
        item['is_group'] = false;
      } else {
        item['is_group'] = true;
      }

      item.headimgurl = think.config('root_api') + '/user/getAvatar?userId=' + item.user_id;
      if (item.is_pay === 0) {
        item.tag = ['未付款'];
      } else {
        item.tag = ['已付款'];
      }
      item.time = think.datetime(new Date(item.insert_date), 'MM-DD HH:mm');
      item.title = item.description;
      item.name = item.user_name;
      item.city_name = item.city_name;
      item.price = item.total;
      delete item.description;
    });

    this.json(list);
  }
  async updateDetailAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const billDetailNum = this.post('billDetailNum');
    const cart = await this.model('cart').where({id: cartId}).find();
    if (think.isEmpty(cart)) {
      this.fail('请先创建购物车');
    } else {
      const group = await this.model('group_bill').where({id: cart.group_bill_id}).find();
      if (!moment(group.end_date).isAfter(moment())) {
        this.fail('团购已经结束不能操作购物车');
      } else if (Number(group.status) === 0) {
        this.fail('团购已经结束不能操作购物车');
      } else {
        const model = this.model('cart_detail').alias('c');
        model.field(['c.*', 'b.price']).join({
          table: 'bill_detail',
          join: 'inner',
          as: 'b',
          on: ['c.bill_detail_id', 'b.id']
        });
        const billDetail = await this.model('bill_detail').where({id: billDetailId}).find();
        let freight = Number(billDetail.price) * billDetailNum * Number(group.freight);
        if (Number(group.top_freight) !== 0) {
          freight = freight > group.top_freight ? group.top_freight : freight;
        }
        await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({
          bill_detail_num: billDetailNum,
          freight: freight
        });
        await this.model('cart').where({id: cartId}).update({
          sum: this.post('sum'),
          freight: this.post('freight')
        });
      }
    }
  }
  async addOrUpdateDetailAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const billDetailNum = this.post('billDetailNum');
    const cart = await this.model('cart').where({id: this.post('cartId')}).find();
    if (Number(billDetailNum) === 0) {
      await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).delete();
    } else if (think.isEmpty(cart)) {
      this.fail('请先创建购物车');
    } else {
      const group = await this.model('group_bill').where({id: cart.group_bill_id}).find();
      if (Number(group.status) === 10) {
        this.fail('团购已经结束不能操作购物车');
      } else {
        const model = this.model('cart_detail').alias('c');
        model.field(['c.*', 'b.price']).join({
          table: 'bill_detail',
          join: 'inner',
          as: 'b',
          on: ['c.bill_detail_id', 'b.id']
        });
        const cartDetail = await model.where({'c.bill_detail_id': billDetailId, 'c.cart_id': cartId}).find();
        const billDetail = await this.model('bill_detail').where({id: billDetailId}).find();
        let freight = Number(billDetail.price) * billDetailNum * Number(group.freight);
        if (Number(group.top_freight) !== 0) {
          freight = freight > group.top_freight ? group.top_freight : freight;
        }
        if (think.isEmpty(cartDetail)) {
          await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).add({
            'cart_id': cartId,
            'bill_detail_id': billDetailId,
            'bill_detail_num': billDetailNum,
            'freight': freight,
            'price': billDetail.price,
            'sum': Number(billDetail.price) * billDetailNum
          });
        } else {
          await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).update({
            'freight': freight,
            'bill_detail_num': billDetailNum,
            'sum': Number(billDetail.price) * billDetailNum
          });
        }
      }
    }
    const sumObj = await this.model('cart_detail').field(['sum(sum) sum', 'sum(freight) freight', 'sum(bill_detail_num) cartCount']).where({'cart_id': cart.id}).find();
    if (!think.isEmpty(sumObj.cartCount)) {
      await this.model('cart').where({'id': cart.id}).update({
        sum: sumObj.sum,
        freight: sumObj.freight
      });
    } else {
      await this.model('cart').where({'id': cart.id}).update({
        sum: 0,
        freight: 0
      });
    }
  }
  async addDetailAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const billDetailNum = this.post('billDetailNum');
    const cart = await this.model('cart').where({id: this.post('cartId')}).find();
    if (think.isEmpty(cart)) {
      this.fail('请先创建购物车');
    } else {
      const group = await this.model('group_bill').where({id: cart.group_bill_id}).find();
      if (!moment(group.end_date).isAfter(moment())) {
        this.fail('团购已经结束不能操作购物车');
      } else if (Number(group.status) === 0) {
        this.fail('团购已经结束不能操作购物车');
      } else {
        await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).add({
          cart_id: cartId,
          bill_detail_id: billDetailId,
          bill_detail_num: billDetailNum
        });
        await this.model('cart').where({id: cartId}).update({
          sum: this.post('sum'),
          freight: this.post('freight')
        });
      }
    }
  }
  async getAction() {
    const id = this.post('cartId');
    const cart = await this.model('cart').where({id: id}).find();
    return this.json(cart);
  }
  async getCartDetailAction() {
    const cartId = this.post('cartId');
    const billDetailId = this.post('billDetailId');
    const cartDetail = await this.model('cart_detail').where({bill_detail_id: billDetailId, cart_id: cartId}).find();
    return this.json(cartDetail);
  }
  async createOrderAction() {
    const user = this.getLoginUser();
    if (think.isEmpty(user.openid)) {
      this.fail('请使用微信账号登录');
    } else {
      const cartId = this.post('cartId');
      const cart = await this.model('cart').where({id: cartId}).find();
      const wexinService = this.service('weixin', 'api');
      const payInfo = {};
      payInfo.orderNo = `Coral-${cart.group_bill_id}-${cartId}` + Math.floor(Math.random() * 10 + 1);
      payInfo.totalFee = Number(cart.sum) + Number(cart.freight) - Number(cart.lost_back) - Number(cart.damage_back);
      payInfo.totalFee = payInfo.totalFee * 100;
      payInfo.openid = 'ohGtg1o1F-fgzmbXElW1fbFNvdDg';
      payInfo.ip = '111.231.136.250';
      payInfo.body = '礁岩海水支付';
      payInfo.cartId = cartId;
      payInfo.userId = user.id;
      const payRequest = await wexinService.createUnifiedOrder(payInfo);
      if (payRequest.error) {
        this.fail(payRequest.error);
      } else {
        await this.model('cart').where({id: cartId}).update({ 'nonceStr': payRequest.nonceStr });
        this.json(payRequest);
      }
    }
  }
  async listDetailAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 50;
    const cartId = this.post('cartId');

    const model = this.model('cart_detail').alias('cd');
    model.field(['cd.*', 'b.size', 'b.price', 'b.point', 'b.material_id', 'm.name material_name', 'b.numbers', 'b.limits', 'b.recommend', 'b.name']).join({
      table: 'cart',
      join: 'inner',
      as: 'c',
      on: ['cd.cart_id', 'c.id']
    }).join({
      table: 'bill_detail',
      join: 'inner',
      as: 'b',
      on: ['b.id', 'cd.bill_detail_id']
    }).join({
      table: 'material',
      join: 'left',
      as: 'm',
      on: ['m.id', 'b.material_id']
    });
    const list = await model.where({'cd.cart_id': cartId}).order(['cd.id DESC']).page(page, size).countSelect();
    return this.json(list);
  }
  async listDetailsAction() {
    const cartId = this.post('cartId');
    const model = this.model('cart_detail').alias('cd');
    model.field(['cd.*', 'b.size', 'b.price', 'b.point', 'b.material_id', 'm.name material_name', 'm.tag', 'b.numbers', 'b.limits', 'b.recommend', 'b.name']).join({
      table: 'cart',
      join: 'inner',
      as: 'c',
      on: ['cd.cart_id', 'c.id']
    }).join({
      table: 'bill_detail',
      join: 'inner',
      as: 'b',
      on: ['b.id', 'cd.bill_detail_id']
    }).join({
      table: 'material',
      join: 'left',
      as: 'm',
      on: ['m.id', 'b.material_id']
    });
    const list = await model.where({'cd.cart_id': cartId}).order(['cd.id DESC']).select();
    const cart = await this.model('cart').where({id: cartId}).find();
    const group = await this.model('group_bill').where({id: cart.group_bill_id}).find();
    return this.json({list, cart, group});
  }
};
