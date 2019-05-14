const Base = require('./base.js');
const moment = require('moment');
const _ = require('lodash');
module.exports = class extends Base {
  /**
   * 获取订单列表
   * @return {Promise} []
   */
  async deliveryAction() {
    if (this.isCli) {
      const orderList = await this.model('order').deliveryOrderList();
      for (const order of orderList) {
        const orderModel = this.service('mall_order', 'mall');
        orderModel.updateOrderStatus(order.id, 203);
        await this.model('user_point').add({
          user_id: this.getLoginUserId(),
          point: 200,
          type: 'mall',
          description: '商城购物奖励'
        });
        return this.success('操作成功');
      }
    }
  }
  async listAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const status = this.post('status');
    const where = {};
    if (!think.isEmpty(status)) {
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

      item.userInfor = await this.model('user').field(['name', 'headimgurl']).where({id: item.user_id}).find();

      item.add_time_format = moment.unix(item.add_time * 1000).format('YYYY-MM-DD HH:mm:ss');

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
    const orderId = this.post('orderId');
    const orderInfo = await this.model('mall_order').where({ id: orderId }).find();

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

  async expressAction() {
    const orderId = this.post('orderId');
    if (think.isEmpty(orderId)) {
      return this.fail('订单不存在');
    }
    const latestExpressInfo = await this.service('mall_order_express', 'mall').getLatestOrderExpress(orderId);
    return this.success(latestExpressInfo);
  }

  async addExpressAction() {
    const orderId = this.post('orderId');
    const shipperId = this.post('shipperId');
    const shipperName = this.post('shipperName');
    const shipperCode = this.post('shipperCode');
    const logisticCode = this.post('logisticCode');
    const nowTime = Number.parseInt(Date.now() / 1000);
    const express = {
      order_id: orderId,
      shipper_id: shipperId,
      shipper_name: shipperName,
      shipper_code: shipperCode,
      logistic_code: logisticCode,
      add_time: nowTime
    };
    const id = await this.model('mall_order_express').add(express);
    express.id = id;
    if (id > 0) {
      await this.model('mall_order').where({id: orderId}).limit(1).update({order_status: 202});
      const order = await this.model('mall_order').where({id: orderId}).find();
      const goods = await this.model('mall_order_goods').where({order_id: orderId}).select();
      const names = goods.map((good) => {
        return good.goods_name;
      });
      const user = await this.model('user').where({id: order.user_id}).find();
      const message = {
        order_id: order.id,
        order_sn: order.order_sn,
        goods_name: names.join(' '),
        shipper_name: shipperName,
        logistic_code: logisticCode,
        address: order.address,
        phone: '13918961783',
        prepay_id: order.prepay_id,
        node: '请前往礁岩海水小程序【我的】- 【订单管理】- 【待收货】 查看物流信息',
        openid: user.openid
      };
      const wexinService = this.service('weixin', 'api');
      const token = await wexinService.getMiniToken(think.config('weixin.mini_appid'), think.config('weixin.mini_secret'));
      wexinService.sendExpressMessage(_.values(token)[0], message);
    }
    return this.json(express);
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
      const wexinService = this.service('weixin', 'api');
      const token = await wexinService.getMiniToken(think.config('weixin.mini_appid'), think.config('weixin.mini_secret'));
      const goods = await this.model('mall_order_goods').where({order_id: orderId}).select();
      const names = goods.map((good) => {
        return good.goods_name;
      });
      const orderInfo = await this.model('mall_order').where({id: orderId}).find();
      const user = await this.model('user').where({id: orderInfo.user_id}).find();
      const message = {
        order_id: orderInfo.id,
        order_sn: orderInfo.order_sn,
        goods_name: names.join(' '),
        address: orderInfo.address,
        account: orderInfo.actual_price,
        prepay_id: orderInfo.prepay_id,
        openid: user.openid
      };
      wexinService.sendCancelMessage(_.values(token)[0], message);
      return this.success('操作成功');
    }
  }

  async returnAction() {
    const orderId = this.post('orderId');
    const userId = this.post('userId');
    const description = this.post('description') || '管理员退款';
    const orderInfo = await this.model('mall_order').where({ id: orderId }).find();
    if (think.isEmpty(orderInfo)) {
      return this.fail('订单不存在');
    } else {
      const returnObj = {
        user_id: userId,
        order_id: orderId,
        code: 102,
        description: description
      };
      const orderModel = this.service('mall_order', 'mall');
      const userAccount = await this.model('user_account').where({order_id: orderId, code: 501}).find() || {account: 0};
      let account = Math.abs(userAccount.account);
      const express = await this.model('mall_order_express').where({order_id: orderId}).find() || {};
      let orderStatus = 102;

      if (express.logistic_code) {
        orderStatus = 103;
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
      if (await orderModel.updateOrderStatus(orderId, orderStatus)) {
        await this.model('user_account').add(returnObj);
        if (!think.isEmpty(userAccount)) {
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
        const user = await this.model('user').where({id: userId}).find();
        const message = {
          order_id: orderInfo.id,
          order_sn: orderInfo.order_sn,
          goods_name: names.join(' '),
          address: orderInfo.address,
          account: returnObj.account,
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
