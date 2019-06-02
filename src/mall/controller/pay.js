/* eslint-disable no-multi-spaces */
const Base = require('./base.js');
const _ = require('lodash');

module.exports = class extends Base {
  /**
   * 获取支付的请求参数
   * @returns {Promise<PreventPromise|void|Promise>}
   */
  async prepayAction() {
    const orderId = this.get('orderId');
    const renew = this.get('renew');
    const orderInfo = await this.model('mall_order').where({ id: orderId }).find();
    if (think.isEmpty(orderInfo)) {
      return this.fail(400, '订单已取消');
    }
    if (parseInt(orderInfo.pay_status) !== 0) {
      return this.fail(400, '订单已支付，请不要重复操作');
    }
    const openid = await this.model('user').where({ id: orderInfo.user_id }).getField('openid', true);
    if (think.isEmpty(openid)) {
      return this.fail('微信支付失败');
    }
    const WeixinSerivce = this.service('weixin', 'mall');
    if (renew === 'renew') {
      orderInfo.order_sn = this.service('mall_order', 'mall').generateOrderNumber();
    }

    try {
      const returnParams = await WeixinSerivce.createMeituanUnifiedOrder({
        openid: openid,
        body: '订单编号：' + orderInfo.order_sn,
        out_trade_no: orderInfo.order_sn,
        total_fee: orderInfo.actual_price > 0 ? parseInt(orderInfo.actual_price * 100) : 1,
        spbill_create_ip: ''
      });
      const perpayId = returnParams.package.split('=')[1];
      const currentTime = parseInt(this.getTime() / 1000);
      this.sendMessageToMallMeanger(orderInfo, currentTime);
      await this.model('mall_order').where({ id: orderId }).update({'pay_time': currentTime, 'prepay_id': perpayId, order_sn: orderInfo.order_sn});
      return this.success(returnParams);
    } catch (err) {
      return this.fail('微信支付失败');
    }
  }
  async sendMessageToMallMeanger(order, payTime) {
    const goods = await this.model('mall_order_goods').where({order_id: order.id}).select();
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
        pay_time: payTime,
        openid: user.public_openid
      };
      if (user.public_openid) {
        await wexinService.sendAdminBuyMessage(_.values(token)[0], message);
      }
    }
  }
  async meinotifyAction() {
    const outTradeNo = this.post('outTradeNo');
    const appId = this.post('appId');
    const subOpenId = this.post('subOpenId');
    if (appId && Number(appId) === 31291) {
      const orderModel = this.service('mall_order', 'mall');
      const orderInfo = await orderModel.getOrderByOrderSn(outTradeNo);
      if (think.isEmpty(orderInfo)) {
        return this.json({'status': 'false'});
      } else {
        const user = await this.model('user').where({id: orderInfo.user_id}).find();
        if (user && user.openid === subOpenId) {
          if (orderModel.updatePayStatus(orderInfo.id, 2)) {
            if (orderInfo.order_status === 101 || orderInfo.order_status === 0) {
              orderModel.updateOrderStatus(orderInfo.id, 201);
              orderModel.updateCouponStatus(orderInfo.coupon_id);
            }
            return this.json({'status': 'SUCCESS'});
          } else {
            return this.json({'status': 'false'});
          }
        } else {
          return this.json({'status': 'false'});
        }
      }
    }
  }

  async notifyAction() {
    const WeixinSerivce = this.service('weixin', 'mall');
    const result = WeixinSerivce.payNotify(this.post('xml'));
    if (!result) {
      return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[支付失败]]></return_msg></xml>`;
    }

    const orderModel = this.service('mall_order', 'mall');

    const orderInfo = await orderModel.getOrderByOrderSn(result.out_trade_no);
    if (think.isEmpty(orderInfo)) {
      return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[订单不存在]]></return_msg></xml>`;
    }

    if (orderModel.updatePayStatus(orderInfo.id, 2)) {
      if (orderInfo.order_status === 101 || orderInfo.order_status === 0) {
        orderModel.updateOrderStatus(orderInfo.id, 201);
        orderModel.updateCouponStatus(orderInfo.coupon_id);
      }
      return `<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`;
    } else {
      return `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[订单不存在]]></return_msg></xml>`;
    }
  }
};
