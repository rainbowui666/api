const _ = require('lodash');

module.exports = class extends think.Service {
  /**
   * 生成订单的编号order_sn
   * @returns {string}
   */
  generateOrderNumber() {
    const date = new Date();
    return date.getFullYear() + _.padStart(date.getMonth(), 2, '0') + _.padStart(date.getDay(), 2, '0') + _.padStart(date.getHours(), 2, '0') + _.padStart(date.getMinutes(), 2, '0') + _.padStart(date.getSeconds(), 2, '0') + _.random(100000, 999999);
  }

  /**
   * 获取订单可操作的选项
   * @param orderId
   * @returns {Promise.<{cancel: boolean, delete: boolean, pay: boolean, comment: boolean, delivery: boolean, confirm: boolean, return: boolean}>}
   */
  async getOrderHandleOption(orderId) {
    const handleOption = {
      cancel: false, // 取消操作
      delete: false, // 删除操作
      pay: false, // 支付操作
      comment: false, // 评论操作
      delivery: false, // 确认收货操作
      confirm: false, // 完成订单操作
      return: false, // 退换货操作
      account: false, // 退换货操作
      help: false, // 退换货操作
      buy: false // 再次购买
    };

    const orderInfo = await this.model('mall_order').where({id: orderId}).find();

    // 订单流程：下单成功－》支付订单－》发货－》收货－》评论
    // 订单相关状态字段设计，采用单个字段表示全部的订单状态
    // 表示订单取消和删除等状态 0订单创建成功等待付款，101订单已取消，102订单已删除
    // 表示订单支付状态,201订单已付款，等待发货
    // 表示订单物流相关状态,202订单已发货，203用户确认收货
    // 表示订单退换货相关的状态,102没有发货，退款,103已收货，退款退货
    // 如果订单已经取消或是已完成，则可删除和再次购买
    // 如果订单没有被取消，且没有支付，则可支付，可取消
    // 0   已经支付未发货未收货
    // 101 未发货已经取消
    // 201 未发货可以退款
    // 102 未收货已经退款
    // 103 已收货已经退款
    // 202 已发货未收货
    // 203 已完成的订单
    if (orderInfo.order_status === 0) {
      handleOption.cancel = true;
      handleOption.pay = true;
    }
    // 取消订单
    if (orderInfo.order_status === 101) {
      handleOption.delete = true;
      handleOption.buy = true;
    }

    // 如果订单已经支付，且未收货，发生退款
    if (orderInfo.order_status === 102) {
      handleOption.comment = true;
      handleOption.account = true;
      handleOption.buy = true;
    }
    // 如果订单已经支付，且已经收货，发生退款
    if (orderInfo.order_status === 103) {
      handleOption.help = true;
      handleOption.buy = true;
    }

    // 如果订单已付款，没有发货，则可退款操作
    if (orderInfo.order_status === 201) {
      handleOption.return = true;
    }

    // 如果订单已经发货，没有收货，则可收货操作和退款、退货操作
    if (orderInfo.order_status === 202) {
      handleOption.delivery = true;
    }

    // 如果订单已经支付，且已经收货，则可完成交易、评论和再次购买
    if (orderInfo.order_status === 203) {
      handleOption.comment = true;
      handleOption.help = true;
    }

    return handleOption;
  }

  async getOrderStatusText(orderId) {
    const orderInfo = await this.model('mall_order').where({id: orderId}).find();
    let statusText = '未付款';
    switch (orderInfo.order_status) {
      case 0:
        statusText = '未付款';
        break;
      case 101:
        statusText = '未付款';
        break;
      case 201:
        statusText = '已付款';
        break;
      case 202:
        statusText = '未确认';
        break;
      case 203:
        statusText = '已确认';
        break;
      case 102:
        statusText = '已退款';
        break;
      case 103:
        statusText = '协商退款中';
        break;
    }

    return statusText;
  }

  /**
   * 更改订单支付状态
   * @param orderId
   * @param payStatus
   * @returns {Promise.<boolean>}
   */
  async updatePayStatus(orderId, payStatus = 0) {
    return this.model('mall_order').where({id: orderId}).limit(1).update({pay_status: parseInt(payStatus)});
  }

  async updateOrderStatus(orderId, orderStatus = 0) {
    return this.model('mall_order').where({id: orderId}).limit(1).update({order_status: parseInt(orderStatus)});
  }

  /**
   * 根据订单编号查找订单信息
   * @param orderSn
   * @returns {Promise.<Promise|Promise<any>|T|*>}
   */
  async getOrderByOrderSn(orderSn) {
    if (think.isEmpty(orderSn)) {
      return {};
    }
    return this.model('mall_order').where({order_sn: orderSn}).find();
  }
};
