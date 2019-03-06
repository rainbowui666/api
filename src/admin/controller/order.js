const Base = require('./base.js');
const moment = require('moment');

module.exports = class extends Base {
  /**
   * 获取订单列表
   * @return {Promise} []
   */
  async listAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const status = this.post('status') || 0;
    const orderList = await this.model('mall_order').where({ order_status: status }).order('id desc').page(page, size).countSelect();
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
    const orderId = this.get('orderId');
    if (think.isEmpty(orderId)) {
      return this.fail('订单不存在');
    }
    const latestExpressInfo = await this.service('mall_order_express', 'mall').getLatestOrderExpress(orderId);
    return this.success(latestExpressInfo);
  }

  async cancelAction() {
    const orderId = this.post('orderId');
    if (think.isEmpty(orderId)) {
      return this.fail('订单不存在');
    }
    const orderModel = this.service('mall_order', 'mall');
    if (orderModel.updateOrderStatus(orderId, 101)) {
      return this.success('操作成功');
    }
  }

  async returnAction() {
    const orderId = this.post('orderId');
    const userId = this.post('userId');
    const description = this.post('description');
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
      if (await orderModel.updateOrderStatus(orderId, 102)) {
        if (orderInfo.order_status === 201) {
          returnObj.account = orderInfo.actual_price;
        } else {
          returnObj.account = orderInfo.actual_price - orderInfo.freight_price;
        }
        await this.model('user_account').add(returnObj);
        return this.success('操作成功');
      }
    }
  }
};
