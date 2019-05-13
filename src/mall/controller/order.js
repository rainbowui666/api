const Base = require('./base.js');
const moment = require('moment');
const _ = require('lodash');
module.exports = class extends Base {
  /**
   * 获取订单列表
   * @return {Promise} []
   */
  async listAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const status = this.post('status') || 0;
    const where = { user_id: this.getLoginUserId() };
    if (status !== 'all') {
      where.order_status = status;
    }
    const orderList = await this.model('mall_order').where(where).order('id desc').page(page, size).countSelect();
    const newOrderList = [];
    for (const item of orderList.data) {
      // 订单的商品
      item.goodsList = await this.model('mall_order_goods').where({ order_id: item.id }).select();
      item.goodsCount = 0;
      item.goodsList.forEach(v => {
        item.goodsCount += v.number;
      });

      // 订单状态的处理
      item.order_status_text = await this.service('mall_order', 'mall').getOrderStatusText(item.id);

      // 可操作的选项
      item.handleOption = await this.service('mall_order', 'mall').getOrderHandleOption(item.id);

      newOrderList.push(item);
    }
    orderList.data = newOrderList;

    return this.success(orderList);
  }

  /**
   * 获取订单详情
   * @return {Promise} []
   */
  async detailAction() {
    const orderId = this.get('orderId');
    const orderInfo = await this.model('mall_order').where({ user_id: this.getLoginUserId(), id: orderId }).find();

    if (think.isEmpty(orderInfo)) {
      return this.fail('订单不存在');
    }

    orderInfo.province_name = await this.model('region').where({ id: orderInfo.province }).getField('name', true);
    orderInfo.city_name = await this.model('region').where({ id: orderInfo.city }).getField('name', true);
    orderInfo.district_name = await this.model('region').where({ id: orderInfo.district }).getField('name', true);
    orderInfo.full_region = orderInfo.province_name + orderInfo.city_name + orderInfo.district_name;

    const latestExpressInfo = await this.service('mall_order_express', 'mall').getLatestOrderExpress(orderId);
    orderInfo.express = latestExpressInfo;

    const orderGoods = await this.model('mall_order_goods').where({ order_id: orderId }).select();

    // 订单状态的处理
    orderInfo.order_status_text = await this.service('mall_order', 'mall').getOrderStatusText(orderId);
    orderInfo.add_time = moment.unix(orderInfo.add_time * 1000).format('YYYY-MM-DD HH:mm:ss');
    orderInfo.final_pay_time = moment('001234', 'Hmmss').format('mm:ss');
    // 订单最后支付时间
    if (orderInfo.order_status === 0) {
      // if (moment().subtract(60, 'minutes') < moment(orderInfo.add_time)) {
      orderInfo.final_pay_time = moment('001234', 'Hmmss').format('mm:ss');
      // } else {
      //     //超过时间不支付，更新订单状态为取消
      // }
    }

    // 订单可操作的选择,删除，支付，收货，评论，退换货
    const handleOption = await this.service('mall_order', 'mall').getOrderHandleOption(orderId);

    return this.success({
      orderInfo: orderInfo,
      orderGoods: orderGoods,
      handleOption: handleOption
    });
  }

  /**
   * 提交订单
   * @returns {Promise.<void>}
   */
  async submitAction() {
    // 获取收货地址信息和计算运费
    const addressId = this.post('addressId');
    const checkedAddress = await this.model('address').where({ id: addressId }).find();
    if (think.isEmpty(checkedAddress)) {
      return this.fail('请选择收货地址');
    }
    // 获取要购买的商品
    const immediatelyToBuy = this.post('immediatelyToBuy');
    const where = { user_id: this.getLoginUserId(), session_id: 1, checked: 1 };
    if (immediatelyToBuy) {
      where.immediately_buy = immediatelyToBuy;
    }
    const checkedGoodsList = await this.model('mall_cart').where(where).select();
    if (think.isEmpty(checkedGoodsList)) {
      return this.fail('请选择商品');
    }

    // 统计商品总价
    let goodsTotalPrice = 0.00;
    for (const cartItem of checkedGoodsList) {
      goodsTotalPrice += cartItem.number * cartItem.retail_price;
    }
    // 获取订单使用的优惠券
    const couponId = this.post('couponId');
    const model = this.model('user_coupon').alias('u');
    model.field(['u.*', 'c.name', 'c.tag', 'c.description', 'c.price', 'c.price_condition']).join({
      table: 'coupon',
      join: 'inner',
      as: 'c',
      on: ['u.coupon_id', 'c.id']
    });
    const coupon = await model.where({'u.id': couponId}).find();
    let couponPrice = 0.00;
    if (!think.isEmpty(couponId) && !think.isEmpty(coupon)) {
      const condition = coupon.price_condition || 0;
      if (goodsTotalPrice >= condition) {
        couponPrice = coupon.price;
      }
    }
    // 根据收货地址计算运费
    let freightPrice = await this.model('region').where({id: checkedAddress.province_id}).getField('freight', true);

    const freightCfg = Number(this.config('goods.freight'));
    if (goodsTotalPrice >= freightCfg) {
      freightPrice = 0.00;
    }
    const orderTotalPrice = this.post('accountPrice') || 0.01;
    // 订单价格计算
    // const orderTotalPrice = goodsTotalPrice + freightPrice - couponPrice - accountPrice; // 订单的总价
    const actualPrice = orderTotalPrice <= 0 ? 0.01 : orderTotalPrice;
    const currentTime = parseInt(this.getTime() / 1000);
    const orderInfo = {
      order_sn: this.service('mall_order', 'mall').generateOrderNumber(),
      user_id: this.getLoginUserId(),
      // 收货地址和运费
      consignee: checkedAddress.name,
      mobile: checkedAddress.mobile,
      province: checkedAddress.province_id,
      city: checkedAddress.city_id,
      district: checkedAddress.district_id,
      address: checkedAddress.address,
      freight_price: freightPrice,
      // 留言
      postscript: this.post('postscript'),
      coupon_id: couponId,
      coupon_price: couponPrice,
      add_time: currentTime,
      goods_price: goodsTotalPrice,
      order_price: orderTotalPrice,
      actual_price: actualPrice
    };
    // 开启事务，插入订单信息和订单商品
    const orderId = await this.model('mall_order').add(orderInfo);
    orderInfo.id = orderId;
    if (!orderId) {
      return this.fail('订单提交失败');
    }
    // 统计商品总价
    const orderGoodsData = [];
    for (const goodsItem of checkedGoodsList) {
      orderGoodsData.push({
        order_id: orderId,
        goods_id: goodsItem.goods_id,
        goods_sn: goodsItem.goods_sn,
        product_id: goodsItem.product_id,
        goods_name: goodsItem.goods_name,
        list_pic_url: goodsItem.list_pic_url,
        market_price: goodsItem.market_price,
        retail_price: goodsItem.retail_price,
        number: goodsItem.number,
        goods_specifition_name_value: goodsItem.goods_specifition_name_value,
        goods_specifition_ids: goodsItem.goods_specifition_ids
      });
    }
    await this.model('mall_order_goods').addMany(orderGoodsData);
    await this.model('mall_cart').where(where).delete();
    if (couponPrice > 0) {
      await this.model('user_coupon').where({id: couponId}).update({useing: 0, used: 1, order_id: orderId});
    }
    const discount = this.post('discount') || 0.00;

    if (discount > 0) {
      const returnObj = {
        user_id: this.getLoginUserId(),
        order_id: orderId,
        code: 501,
        account: -discount,
        description: '购买商品使用'
      };
      await this.model('user_account').add(returnObj);
    }
    await this.model('user_point').add({
      user_id: this.getLoginUserId(),
      point: 200,
      type: 'mall',
      description: '购物积分奖励'
    });
    return this.success({ orderInfo: orderInfo });
  }

  /**
   * 查询物流信息
   * @returns {Promise.<void>}
   */
  async expressAction() {
    const orderId = this.get('orderId');
    if (think.isEmpty(orderId)) {
      return this.fail('订单不存在');
    }
    const latestExpressInfo = await this.service('mall_order_express', 'mall').getLatestOrderExpress(orderId);
    return this.success(latestExpressInfo);
  }
  async deliveryAction() {
    const orderId = this.post('orderId');
    if (think.isEmpty(orderId)) {
      return this.fail('订单不存在');
    }
    const orderModel = this.service('mall_order', 'mall');
    orderModel.updateOrderStatus(orderId, 203);
    await this.model('user_point').add({
      user_id: this.getLoginUserId(),
      point: 200,
      type: 'mall',
      description: '商城购物奖励'
    });
    return this.success('操作成功');
  }

  async cancelAction() {
    const orderId = this.post('orderId');
    if (think.isEmpty(orderId)) {
      return this.fail('订单不存在');
    }
    const orderModel = this.service('mall_order', 'mall');
    if (orderModel.updateOrderStatus(orderId, 101)) {
      const userAccount = await this.model('user_account').where({order_id: orderId, code: 501}).find();
      if (!think.isEmpty(userAccount)) {
        const account = Math.abs(userAccount.account);
        const returnObj = {
          user_id: this.getLoginUserId(),
          order_id: orderId,
          code: 502,
          account,
          description: userAccount.description + '退款'
        };
        await this.model('user_account').add(returnObj);
      }
      // const userCoupon = await this.model('user_coupon').where({order_id: orderId}).find();
      // if (!think.isEmpty(userCoupon)) {
      //   await this.model('user_coupon').where({id: userCoupon.id}).update({useing: 0, used: 0, order_id: 0});
      // }
      return this.success('操作成功');
    }
  }

  async returnSubmitAction() {
    const orderId = this.post('orderId');
    const description = this.post('description');
    const order = await this.model('mall_order').where({ user_id: this.getLoginUserId(), id: orderId }).find();
    if (think.isEmpty(order)) {
      return this.fail('订单不存在');
    } else {
      const goods = await this.model('mall_order_goods').where({order_id: orderId}).select();
      const names = goods.map((good) => {
        return good.goods_name;
      });
      const wexinService = this.service('weixin', 'api');
      const token = await wexinService.getToken(think.config('weixin.public_appid'), think.config('weixin.public_secret'));
      const model = this.model('user').alias('u');
      const list = await model.field(['u.public_openid', 'u.phone'])
        .join({
          table: 'user_type_relation',
          join: 'inner',
          as: 'r',
          on: ['r.user_id', 'u.id']
        })
        .where({'r.type_id': 11}).select();

      for (const user of list) {
        const message = {
          order_id: order.id,
          order_sn: order.order_sn,
          goods_name: names.join(' '),
          address: order.address,
          account: order.actual_price,
          phone: user.phone,
          prepay_id: order.prepay_id,
          description: description,
          openid: user.public_openid
        };
        if (user.public_openid) {
          await wexinService.sendAdminReturnMessage(_.values(token)[0], message);
        }
      }
      await this.model('mall_order').where({id: orderId}).limit(1).update({order_status: 104});
      return this.success(true);
    }
  }
  async returnAction() {
    const orderId = this.post('orderId');
    const description = this.post('description');
    const orderInfo = await this.model('mall_order').where({ user_id: this.getLoginUserId(), id: orderId }).find();
    if (think.isEmpty(orderInfo)) {
      return this.fail('订单不存在');
    } else if (orderInfo.order_status !== 104) {
      return this.fail('订单已退款');
    } else {
      const returnObj = {
        user_id: this.getLoginUserId(),
        order_id: orderId,
        code: 102,
        description: description
      };

      const orderModel = this.service('mall_order', 'mall');
      const userAccount = await this.model('user_account').where({order_id: orderId, code: 501}).find() || {account: 0};
      let account = Math.abs(userAccount.account);
      const express = await this.model('mall_order_express').where({order_id: orderId}).find() || {};
      if (express.logistic_code) {
        if (orderInfo.actual_price > orderInfo.freight_price) {
          returnObj.account = orderInfo.actual_price - orderInfo.freight_price;
        } else if (account > orderInfo.freight_price) {
          returnObj.account = orderInfo.actual_price;
          account = account - orderInfo.freight_price;
        } else {
          returnObj.account = orderInfo.actual_price;
        }
      } else {
        returnObj.account = orderInfo.actual_price;
      }

      if (await orderModel.updateOrderStatus(orderId, 102)) {
        await this.model('user_account').add(returnObj);

        if (!think.isEmpty(userAccount)) {
          const account = Math.abs(userAccount.account);
          const returnObj = {
            user_id: this.getLoginUserId(),
            order_id: orderId,
            code: 502,
            account,
            description: userAccount.description + '退款'
          };
          await this.model('user_account').add(returnObj);
        }
        // const userCoupon = await this.model('user_coupon').where({order_id: orderId}).find();
        // if (!think.isEmpty(userCoupon)) {
        //   await this.model('user_coupon').where({id: userCoupon.id}).update({useing: 0, used: 0, order_id: 0});
        // }

        const wexinService = this.service('weixin', 'api');
        const token = await wexinService.getMiniToken(think.config('weixin.mini_appid'), think.config('weixin.mini_secret'));
        const goods = await this.model('mall_order_goods').where({order_id: orderId}).select();
        const names = goods.map((good) => {
          return good.goods_name;
        });
        const user = await this.model('user').where({id: this.getLoginUserId()}).find();
        const message = {
          order_id: orderInfo.id,
          order_sn: orderInfo.order_sn,
          goods_name: names.join(' '),
          address: orderInfo.address,
          account: orderInfo.actual_price,
          phone: '13918961783',
          prepay_id: orderInfo.prepay_id,
          openid: user.openid
        };
        wexinService.sendReturnMessage(_.values(token)[0], message);
        return this.success('操作成功');
      }
    }
  }
};
