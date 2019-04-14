const Base = require('./base.js');

module.exports = class extends Base {
  /**
   * 获取购物车中的数据
   * @returns {Promise.<{cartList: *, cartTotal: {goodsCount: number, goodsAmount: number, checkedGoodsCount: number, checkedGoodsAmount: number}}>}
   */
  async getCart(immediatelyToBuy) {
    const where = {user_id: this.getLoginUserId(), session_id: 1};
    if (immediatelyToBuy) {
      where.immediately_buy = immediatelyToBuy;
    }
    const cartList = await this.model('mall_cart').where(where).select();
    // 获取购物车统计信息
    let goodsCount = 0;
    let goodsAmount = 0.00;
    let checkedGoodsCount = 0;
    let checkedGoodsAmount = 0.00;
    for (const cartItem of cartList) {
      goodsCount += cartItem.number;
      goodsAmount += cartItem.number * cartItem.retail_price;
      if (!think.isEmpty(cartItem.checked)) {
        checkedGoodsCount += cartItem.number;
        checkedGoodsAmount += cartItem.number * cartItem.retail_price;
      }

      // 查找商品的图片
      cartItem.list_pic_url = await this.model('mall_goods').where({id: cartItem.goods_id}).getField('list_pic_url', true);
    }

    return {
      cartList: cartList,
      cartTotal: {
        goodsCount: goodsCount,
        goodsAmount: goodsAmount,
        checkedGoodsCount: checkedGoodsCount,
        checkedGoodsAmount: checkedGoodsAmount
      }
    };
  }

  /**
   * 获取购物车信息，所有对购物车的增删改操作，都要重新返回购物车的信息
   * @return {Promise} []
   */
  async indexAction() {
    return this.success(await this.getCart());
  }

  /**
   * 添加商品到购物车
   * @returns {Promise.<*>}
   */
  async addAction() {
    const goodsId = this.post('goodsId');
    const productId = this.post('productId');
    const number = this.post('number');
    const immediatelyBuy = this.post('immediatelyBuy');

    // 判断商品是否可以购买
    const goodsInfo = await this.model('mall_goods').where({id: goodsId}).find();
    if (think.isEmpty(goodsInfo) || goodsInfo.is_delete === 1) {
      return this.fail('商品已下架');
    }

    // 取得规格的信息,判断规格库存
    const productInfo = await this.model('mall_product').where({goods_id: goodsId, id: productId}).find();
    if (think.isEmpty(productInfo) || productInfo.goods_number < number) {
      return this.fail('库存不足');
    }

    // 判断购物车中是否存在此规格商品
    await this.model('mall_cart').where({immediately_buy: 1, user_id: this.getLoginUserId()}).delete();

    const cartInfo = await this.model('mall_cart').where({goods_id: goodsId, product_id: productId, user_id: this.getLoginUserId()}).find();
    if (think.isEmpty(cartInfo)) {
      // 添加操作

      // 添加规格名和值
      let goodsSepcifitionValue = [];
      if (!think.isEmpty(productInfo.goods_specification_ids)) {
        goodsSepcifitionValue = await this.model('mall_goods_specification').where({
          goods_id: goodsId,
          id: {'in': productInfo.goods_specification_ids.split('_')}
        }).getField('value');
      }
      // 添加到购物车
      const cartData = {
        goods_id: goodsId,
        product_id: productId,
        goods_sn: productInfo.goods_sn,
        goods_name: goodsInfo.name,
        list_pic_url: goodsInfo.list_pic_url,
        number: number,
        session_id: 1,
        user_id: this.getLoginUserId(),
        retail_price: productInfo.retail_price,
        market_price: productInfo.retail_price,
        goods_specifition_name_value: goodsSepcifitionValue.join(';'),
        goods_specifition_ids: productInfo.goods_specification_ids,
        checked: 1
      };
      if (immediatelyBuy === 1) {
        cartData.immediately_buy = immediatelyBuy;
      }
      await this.model('mall_cart').add(cartData);
    } else {
      // 如果已经存在购物车中，则数量增加
      if (productInfo.goods_number < (number + cartInfo.number)) {
        return this.fail('库存不足');
      }

      await this.model('mall_cart').where({
        goods_id: goodsId,
        product_id: productId,
        id: cartInfo.id
      }).increment('number', number);
    }
    return this.success(await this.getCart());
  }

  // 更新指定的购物车信息
  async updateAction() {
    const goodsId = this.post('goodsId');
    const productId = this.post('productId'); // 新的product_id
    const id = this.post('id'); // cart.id
    const number = parseInt(this.post('number')); // 不是

    // 取得规格的信息,判断规格库存
    const productInfo = await this.model('mall_product').where({goods_id: goodsId, id: productId}).find();
    if (think.isEmpty(productInfo) || productInfo.goods_number < number) {
      return this.fail(400, '库存不足');
    }

    // 判断是否已经存在product_id购物车商品
    const cartInfo = await this.model('mall_cart').where({id: id}).find();
    // 只是更新number
    if (cartInfo.product_id === productId) {
      await this.model('mall_cart').where({id: id}).update({
        number: number
      });

      return this.success(await this.getCart());
    }

    const newCartInfo = await this.model('mall_cart').where({goods_id: goodsId, product_id: productId}).find();
    if (think.isEmpty(newCartInfo)) {
      // 直接更新原来的cartInfo

      // 添加规格名和值
      let goodsSepcifition = [];
      if (!think.isEmpty(productInfo.goods_specification_ids)) {
        goodsSepcifition = await this.model('mall_goods_specification').field(['mall_goods_specification.*', 'mall_specification.name']).join('mall_specification ON mall_specification.id=mall_goods_specification.specification_id').where({
          'mall_goods_specification.goods_id': goodsId,
          'mall_goods_specification.id': {'in': productInfo.goods_specification_ids.split('_')}
        }).select();
      }

      const cartData = {
        number: number,
        goods_specifition_name_value: JSON.stringify(goodsSepcifition),
        goods_specifition_ids: productInfo.goods_specification_ids,
        retail_price: productInfo.retail_price,
        market_price: productInfo.retail_price,
        product_id: productId,
        goods_sn: productInfo.goods_sn
      };

      await this.model('mall_cart').where({id: id}).update(cartData);
    } else {
      // 合并购物车已有的product信息，删除已有的数据
      const newNumber = number + newCartInfo.number;

      if (think.isEmpty(productInfo) || productInfo.goods_number < newNumber) {
        return this.fail(400, '库存不足');
      }

      await this.model('mall_cart').where({id: newCartInfo.id}).delete();

      const cartData = {
        number: newNumber,
        goods_specifition_name_value: newCartInfo.goods_specifition_name_value,
        goods_specifition_ids: newCartInfo.goods_specification_ids,
        retail_price: productInfo.retail_price,
        market_price: productInfo.retail_price,
        product_id: productId,
        goods_sn: productInfo.goods_sn
      };

      await this.model('mall_cart').where({id: id}).update(cartData);
    }

    return this.success(await this.getCart());
  }

  // 是否选择商品，如果已经选择，则取消选择，批量操作
  async checkedAction() {
    let productId = this.post('productIds').toString();
    const isChecked = this.post('isChecked');

    if (think.isEmpty(productId)) {
      return this.fail('删除出错');
    }

    productId = productId.split(',');
    await this.model('mall_cart').where({product_id: {'in': productId}}).update({checked: parseInt(isChecked)});

    return this.success(await this.getCart());
  }

  // 删除选中的购物车商品，批量删除
  async deleteAction() {
    let productId = this.post('productIds');
    if (!think.isString(productId)) {
      return this.fail('删除出错');
    }

    productId = productId.split(',');

    await this.model('mall_cart').where({product_id: {'in': productId}}).delete();

    return this.success(await this.getCart());
  }

  // 获取购物车商品的总件件数
  async goodscountAction() {
    const cartData = await this.getCart();
    return this.success({
      cartTotal: {
        goodsCount: cartData.cartTotal.goodsCount
      }
    });
  }
  async deleteImmediatelyBuyAction() {
    await this.model('mall_cart').where({immediately_buy: 1, user_id: this.getLoginUserId()}).delete();
  }

  /**
   * 订单提交前的检验和填写相关订单信息
   * @returns {Promise.<void>}
   */
  async checkoutAction() {
    const addressId = this.get('addressId'); // 收货地址id
    // const couponId = this.get('couponId'); // 使用的优惠券id
    // 选择的收货地址
    let checkedAddress = null;
    if (addressId === 0) {
      checkedAddress = await this.model('address').where({
        is_default: 1,
        user_id: this.getLoginUserId()
      }).find();
    } else {
      checkedAddress = await this.model('address').where({
        id: addressId,
        user_id: this.getLoginUserId()
      }).find();
    }
    if (!think.isEmpty(checkedAddress)) {
      checkedAddress.province_name = await this.model('region').where({id: checkedAddress.province_id}).getField('name', true);
      checkedAddress.city_name = await this.model('region').where({id: checkedAddress.city_id}).getField('name', true);
      checkedAddress.district_name = await this.model('region').where({id: checkedAddress.district_id}).getField('name', true);
      checkedAddress.full_region = checkedAddress.province_name + checkedAddress.city_name + checkedAddress.district_name;
    } else {
      checkedAddress.id = -1;
    }

    // 获取要购买的商品
    const immediatelyToBuy = this.get('immediatelyToBuy');
    const cartData = await this.getCart(immediatelyToBuy);
    const checkedGoodsList = cartData.cartList.filter(function(v) {
      return v.checked === 1;
    });

    // 获取可用的优惠券信息，功能还示实现
    const couponList = await this.model('user_coupon').where({used: 0, user_id: this.getLoginUserId(), used_time: ['>', new Date().getTime() / 1000]}).select();
    const model = this.model('user_coupon').alias('u');
    model.field(['u.*', 'c.name', 'c.tag', 'c.description', 'c.price', 'c.price_condition']).join({
      table: 'coupon',
      join: 'inner',
      as: 'c',
      on: ['u.coupon_id', 'c.id']
    });
    const coupon = await model.where({'u.useing': 1, 'u.used': 0, 'u.user_id': this.getLoginUserId(), 'u.used_time': ['>', new Date().getTime() / 1000]}).find();
    let couponPrice = 0.00; // 使用优惠券减免的金额
    const goodsTotalPrice = cartData.cartTotal.checkedGoodsAmount; // 商品总价

    if (!think.isEmpty(coupon)) {
      const condition = coupon.price_condition || 0;
      if (goodsTotalPrice >= condition) {
        couponPrice = coupon.price;
      }
    }
    // 根据收货地址计算运费
    let freightPrice = 8.00;
    const freightCfg = Number(this.config('goods.freight'));
    if (goodsTotalPrice >= freightCfg) {
      freightPrice = 0.00;
    }

    // 计算订单的费用
    const orderTotalPrice = cartData.cartTotal.checkedGoodsAmount + freightPrice - couponPrice; // 订单的总价
    const actualPrice = orderTotalPrice <= 0 ? 0.01 : orderTotalPrice;

    return this.success({
      checkedAddress: checkedAddress,
      freightPrice: freightPrice,
      checkedCoupon: {},
      couponList: couponList,
      couponPrice: couponPrice,
      checkedGoodsList: checkedGoodsList,
      goodsTotalPrice: goodsTotalPrice,
      orderTotalPrice: orderTotalPrice,
      actualPrice: actualPrice
    });
  }
};
