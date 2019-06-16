const Base = require('./base.js');

module.exports = class extends Base {
  async indexAction() {
    const model = this.model('mall_goods');
    const goodsList = await model.select();

    return this.success(goodsList);
  }

  async getOpenGroupAction() {
    const date = new Date().getTime() / 1000;
    const groups = await this.model('mall_group').alias('g').field(['g.*', 'm.list_pic_url']).where({'g.end_time': ['>=', date]}).join({
      table: 'mall_goods',
      join: 'inner',
      as: 'm',
      on: ['g.goods_id', 'm.id']
    }).select();
    const grouplist = [];
    for (const group of groups) {
      const count = await this.model('mall_order').field('count(1) count').where({group_id: group.id}).find();
      const number = group.group_number - (count.count + group.cheat);
      if (number > 0) {
        grouplist.push(group);
      }
    }
    return this.json(grouplist);
  }

  async getOpenGroupListAction() {
    const page = this.get('page') || 1;
    const size = this.get('size') || 10;
    const groups = await this.model('mall_group').alias('g').field(['g.*', 'm.list_pic_url']).join({
      table: 'mall_goods',
      join: 'inner',
      as: 'm',
      on: ['g.goods_id', 'm.id']
    }).order('g.id desc').page(page, size).countSelect();
    return this.json(groups);
  }

  async getOpenGroupByIdAction() {
    const id = this.post('groupId');
    const groups = await this.model('mall_group').alias('g').field(['g.*', 'm.list_pic_url']).where({'g.id': id}).join({
      table: 'mall_goods',
      join: 'inner',
      as: 'm',
      on: ['g.goods_id', 'm.id']
    }).find();
    return this.json(groups);
  }

  async getHotGoodsAction() {
    const where = {is_on_sale: 1};
    const goods = await this.model('mall_order_goods').field(['goods_id']).order('id desc').select();
    const ids = [];
    for (const good of goods) {
      ids.push(good.goods_id);
    }
    where.id = ['IN', ids];
    const hotGoods = await this.model('mall_goods').field(['id', 'name', 'list_pic_url', 'retail_price', 'goods_brief']).where(where).limit(4).select();
    this.json(hotGoods.reverse());
  }

  async getNewGoodsAction() {
    const newGoods = await this.model('mall_goods').field(['id', 'name', 'list_pic_url', 'retail_price']).where({is_new: 1, is_on_sale: 1}).order('id desc').limit(4).select();
    this.json(newGoods);
  }
  /**
   * 获取sku信息，用于购物车编辑时选择规格
   * @returns {Promise.<Promise|PreventPromise|void>}
   */
  async skuAction() {
    const goodsId = this.get('id');
    const model = this.model('mall_goods');

    return this.success({
      specificationList: await model.getSpecificationList(goodsId),
      productList: await model.getProductList(goodsId)
    });
  }

  async getGoodsCommentAction(id) {
    const goodsId = id || this.get('id');
    const commentCount = await this.model('comment').where({value_id: goodsId, type_id: 0}).count();
    const hotComment = await this.model('comment').where({value_id: goodsId, type_id: 0}).order('id desc').find();
    let commentInfo = {};
    if (!think.isEmpty(hotComment)) {
      const commentUser = await this.model('user').field(['nickname', 'name username', 'headimgurl avatar']).where({id: hotComment.user_id}).find();
      commentInfo = {
        content: Buffer.from(hotComment.content, 'base64').toString(),
        add_time: think.datetime(new Date(hotComment.add_time * 1000)),
        nickname: commentUser.nickname,
        avatar: commentUser.avatar,
        pic_list: await this.model('comment_picture').where({comment_id: hotComment.id}).select()
      };
    }

    const comment = {
      count: commentCount,
      data: commentInfo
    };

    return this.json(comment);
  }

  /**
   * 商品详情页数据
   * @returns {Promise.<Promise|PreventPromise|void>}
   */
  async detailAction(id) {
    const goodsId = id || this.get('id');
    const model = this.model('mall_goods');

    const info = await model.where({'id': goodsId}).find();
    const gallery = await this.model('mall_goods_gallery').where({goods_id: goodsId}).limit(4).select();
    const attribute = await this.model('mall_goods_attribute').field('mall_goods_attribute.value, mall_attribute.name').join('mall_attribute ON mall_goods_attribute.attribute_id=mall_attribute.id').order({'mall_goods_attribute.id': 'asc'}).where({'mall_goods_attribute.goods_id': goodsId}).select();
    const issue = await this.model('mall_goods_issue').where({goods_id: ['IN', [0, goodsId]]}).select();
    const brand = await this.model('mall_brand').where({id: info.brand_id}).find();
    const commentCount = await this.model('comment').where({value_id: goodsId, type_id: 0}).count();
    const hotComment = await this.model('comment').where({value_id: goodsId, type_id: 0}).order('id desc').find();
    let commentInfo = {};
    if (!think.isEmpty(hotComment)) {
      const commentUser = await this.model('user').field(['nickname', 'name username', 'headimgurl avatar']).where({id: hotComment.user_id}).find();
      commentInfo = {
        content: Buffer.from(hotComment.content, 'base64').toString(),
        add_time: think.datetime(new Date(hotComment.add_time * 1000)),
        nickname: commentUser.nickname,
        avatar: commentUser.avatar,
        pic_list: await this.model('comment_picture').where({comment_id: hotComment.id}).select()
      };
    }

    const comment = {
      count: commentCount,
      data: commentInfo
    };

    // 当前用户是否收藏
    const userHasCollect = await this.service('mall_collect', 'mall').isUserHasCollect(this.getLoginUserId(), 0, goodsId);

    // 记录用户的足迹 TODO
    await await this.service('mall_footprint', 'mall').addFootprint(this.getLoginUserId(), goodsId);

    // return this.json(jsonData);
    return this.success({
      info: info,
      gallery: gallery,
      attribute: attribute,
      userHasCollect: userHasCollect,
      issue: issue,
      comment: comment,
      brand: brand,
      specificationList: await this.service('mall_goods', 'mall').getSpecificationList(goodsId),
      productList: await this.service('mall_goods', 'mall').getProductList(goodsId)
    });
  }

  /**
   * 获取分类下的商品
   * 1005000 家居
   * 1005001 餐厨
   * 1005002 饮食
   * 1008000 配件
   * 1010000 服装
   * 1011000 婴童
   * 1012000 杂货
   * 1013001 洗护
   * 1019000 志趣
   * @returns {Promise.<*>}
   */
  async categoryAction() {
    const model = this.model('category');
    const currentCategory = await model.where({id: this.get('id')}).find();
    const parentCategory = await model.where({id: currentCategory.parent_id}).find();
    const brotherCategory = await model.where({parent_id: currentCategory.parent_id}).select();

    return this.success({
      currentCategory: currentCategory,
      parentCategory: parentCategory,
      brotherCategory: brotherCategory
    });
  }

  /**
   * 获取商品列表
   * @returns {Promise.<*>}
   */
  async listAction() {
    const categoryId = this.get('categoryId');
    const brandId = this.get('brandId');
    const keyword = this.get('keyword');
    const isNew = this.get('isNew');
    const isHot = this.get('isHot');
    const page = this.get('page');
    const size = this.get('size');
    const sort = this.get('sort');
    const order = this.get('order');

    const goodsQuery = this.model('mall_goods');

    // 查询条件的map
    const whereMap = {is_delete: 0, is_on_sale: 1};
    if (!think.isEmpty(isNew)) {
      whereMap.is_new = isNew;
    }

    if (!think.isEmpty(isHot)) {
      whereMap.is_hot = isHot;
    }

    if (!think.isEmpty(keyword)) {
      whereMap.name = ['like', `%${keyword}%`];
      // 添加到搜索历史
      await this.model('mall_search_history').add({
        keyword: keyword,
        user_id: this.getLoginUserId(),
        add_time: parseInt(new Date().getTime() / 1000)
      });
    }

    if (!think.isEmpty(brandId)) {
      whereMap.brand_id = brandId;
    }

    // 排序
    let orderMap = {};
    if (sort === 'price') {
      // 按价格
      orderMap = {
        retail_price: order
      };
    } else {
      // 按商品添加时间
      orderMap = {
        id: 'desc'
      };
    }

    // 筛选的分类
    let filterCategory = [{
      'id': 0,
      'name': '全部',
      'checked': false
    }];

    const categoryIds = await goodsQuery.where(whereMap).getField('category_id', 10000);
    if (!think.isEmpty(categoryIds)) {
      // 查找二级分类的parent_id
      const parentIds = await this.model('category').where({id: {'in': categoryIds}}).getField('parent_id', 10000);
      // 一级分类
      const parentCategory = await this.model('category').field(['id', 'name']).order({'sort_order': 'asc'}).where({'id': {'in': parentIds}}).select();

      if (!think.isEmpty(parentCategory)) {
        filterCategory = filterCategory.concat(parentCategory);
      }
    }

    // 加入分类条件
    if (!think.isEmpty(categoryId) && parseInt(categoryId) > 0) {
      whereMap.category_id = ['in', await this.service('mall_category', 'mall').getCategoryWhereIn(categoryId)];
    }

    // 搜索到的商品
    const goodsData = await goodsQuery.where(whereMap).field(['id', 'name', 'list_pic_url', 'retail_price']).order(orderMap).page(page, size).countSelect();
    goodsData.filterCategory = filterCategory.map(function(v) {
      v.checked = (think.isEmpty(categoryId) && v.id === 0) || v.id === parseInt(categoryId);
      return v;
    });
    goodsData.goodsList = goodsData.data;

    if (this.get('search') && !think.isEmpty(keyword)) {
      const materialList = await this.model('material').field(['id', 'name']).where({'name|tag|ename|sname': ['like', `%${keyword}%`]}).order(['id DESC']).page(page, 100).countSelect();
      goodsData.goodsList = goodsData.goodsList.concat(materialList.data);
    }

    return this.success(goodsData);
  }

  /**
   * 商品列表筛选的分类列表
   * @returns {Promise.<Promise|void|PreventPromise>}
   */
  async filterAction() {
    const categoryId = this.get('categoryId');
    const keyword = this.get('keyword');
    const isNew = this.get('isNew');
    const isHot = this.get('isHot');

    const goodsQuery = this.model('mall_goods');

    if (!think.isEmpty(categoryId)) {
      goodsQuery.where({category_id: {'in': await this.service('mall_category', 'mall').getChildCategoryId(categoryId)}});
    }

    if (!think.isEmpty(isNew)) {
      goodsQuery.where({is_new: isNew});
    }

    if (!think.isEmpty(isHot)) {
      goodsQuery.where({is_hot: isHot});
    }

    if (!think.isEmpty(keyword)) {
      goodsQuery.where({name: {'like': `%${keyword}%`}});
    }

    let filterCategory = [{
      'id': 0,
      'name': '全部'
    }];

    // 二级分类id
    const categoryIds = await goodsQuery.getField('category_id', 10000);
    if (!think.isEmpty(categoryIds)) {
      // 查找二级分类的parent_id
      const parentIds = await this.model('category').where({id: {'in': categoryIds}}).getField('parent_id', 10000);
      // 一级分类
      const parentCategory = await this.model('category').field(['id', 'name']).order({'sort_order': 'asc'}).where({'id': {'in': parentIds}}).select();

      if (!think.isEmpty(parentCategory)) {
        filterCategory = filterCategory.concat(parentCategory);
      }
    }

    return this.success(filterCategory);
  }

  /**
   * 新品首发
   * @returns {Promise.<Promise|void|PreventPromise>}
   */
  async newAction() {
    return this.success({
      bannerInfo: {
        url: '',
        name: '坚持初心，为你寻觅世间好物',
        img_url: 'http://yanxuan.nosdn.127.net/8976116db321744084774643a933c5ce.png'
      }
    });
  }

  /**
   * 人气推荐
   * @returns {Promise.<Promise|void|PreventPromise>}
   */
  async hotAction() {
    return this.success({
      bannerInfo: {
        url: '',
        name: '大家都在买的严选好物',
        img_url: 'http://yanxuan.nosdn.127.net/8976116db321744084774643a933c5ce.png'
      }
    });
  }

  /**
   * 商品详情页的大家都在看的商品
   * @returns {Promise.<Promise|PreventPromise|void>}
   */
  async relatedAction() {
    // 大家都在看商品,取出关联表的商品，如果没有则随机取同分类下的商品
    const model = this.model('mall_goods');
    const goodsId = this.get('id');
    const relatedGoodsIds = await this.model('mall_related_goods').where({goods_id: goodsId}).getField('related_goods_id');
    let relatedGoods = null;
    if (think.isEmpty(relatedGoodsIds)) {
      // 查找同分类下的商品
      const goodsCategory = await model.where({id: goodsId}).find();
      relatedGoods = await model.where({category_id: goodsCategory.category_id, is_on_sale: 1}).field(['id', 'name', 'list_pic_url', 'retail_price']).limit(8).select();
    } else {
      relatedGoods = await model.where({id: ['IN', relatedGoodsIds]}).field(['id', 'name', 'list_pic_url', 'retail_price']).select();
    }

    return this.success({
      goodsList: relatedGoods
    });
  }

  /**
   * 在售的商品总数
   * @returns {Promise.<Promise|PreventPromise|void>}
   */
  async countAction() {
    const goodsCount = await this.model('mall_goods').where({is_delete: 0, is_on_sale: 1}).count('id');

    return this.success({
      goodsCount: goodsCount
    });
  }
};
