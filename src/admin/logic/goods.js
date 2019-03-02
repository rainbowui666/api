module.exports = class extends think.Logic {
  getHotGoodsAction() {
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, trim: true},
      size: {int: true, trim: true}
    };
  }

  getNewGoodsAction() {
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, trim: true},
      size: {int: true, trim: true}
    };
  }

  async getGoodsCommentAction() {
    this.allowMethods = 'post';
    this.rules = {
      goodsId: {int: true, required: true, trim: true}
    };
  }

  async getTypeByCategoryIdAction() {
    this.allowMethods = 'post';
    this.rules = {
      categoryId: {int: true, required: true, trim: true}
    };
  }

  async detailAction() {
    this.allowMethods = 'post';
    this.rules = {
      goodsId: {int: true, required: true, trim: true}
    };
  }

  async listAction() {
    this.allowMethods = 'post';
    this.rules = {
      categoryId: {int: true, trim: true},
      brandId: {int: true, trim: true},
      keyword: {string: true, trim: true},
      isNew: {int: true, trim: true},
      isHot: {int: true, trim: true},
      page: {int: true, trim: true},
      size: {int: true, trim: true},
      sort: {string: true, trim: true},
      order: {string: true, trim: true}
    };
  }
  addAction() {
    this.allowMethods = 'post';
    this.rules = {
      categoryId: {int: true, required: true, trim: true},
      goodsSn: {string: true, trim: true},
      name: {string: true, required: true, trim: true},
      brandId: {int: true, trim: true},
      keywords: {string: true, trim: true},
      goodsBrief: {string: true, trim: true},
      goodsDesc: {file: true, required: true, trim: true},
      sortOrder: {int: true, trim: true},
      counterPrice: {float: true, required: true, trim: true},
      unitPrice: {float: true, trim: true},
      retailPrice: {float: true, required: true, trim: true},
      extraPrice: {float: true, trim: true},
      isNew: {float: true, trim: true},
      isHot: {float: true, trim: true},
      goodsUnit: {string: true, required: true, trim: true},
      promotionDesc: {string: true, trim: true},
      promotionTag: {string: true, trim: true},
      isLimited: {int: true, trim: true}
    };
  }
};
