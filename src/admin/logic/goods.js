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
      sortOrder: {int: true, trim: true},
      counterPrice: {float: true, required: true, trim: true},
      unitPrice: {float: true, trim: true},
      retailPrice: {float: true, required: true, trim: true},
      extraPrice: {float: true, trim: true},
      isNew: {int: true, trim: true},
      isHot: {int: true, trim: true},
      goodsUnit: {string: true, required: true, trim: true},
      promotionDesc: {string: true, trim: true},
      promotionTag: {string: true, trim: true},
      isLimited: {int: true, trim: true}
    };
  }
  updateAction() {
    this.allowMethods = 'post';
    this.rules = {
      goodsId: {int: true, required: true, trim: true},
      categoryId: {int: true, required: true, trim: true},
      goodsSn: {string: true, trim: true},
      name: {string: true, required: true, trim: true},
      brandId: {int: true, trim: true},
      keywords: {string: true, trim: true},
      goodsBrief: {string: true, trim: true},
      sortOrder: {int: true, trim: true},
      counterPrice: {float: true, required: true, trim: true},
      unitPrice: {float: true, trim: true},
      retailPrice: {float: true, required: true, trim: true},
      extraPrice: {float: true, trim: true},
      isNew: {int: true, trim: true},
      isHot: {int: true, trim: true},
      goodsUnit: {string: true, required: true, trim: true},
      promotionDesc: {string: true, trim: true},
      promotionTag: {string: true, trim: true},
      isLimited: {int: true, trim: true}
    };
  }
  uploadDescAction() {
    this.allowMethods = 'post';
    this.rules = {
      goodsId: {int: true, required: true, trim: true},
      img: {file: true, required: true, trim: true}
    };
  }
  getSpecificationAction() {
    this.allowMethods = 'post';
    this.rules = {
    };
  }
  getGoodsSpecificationAction() {
    this.allowMethods = 'post';
    this.rules = {
      goodsId: {int: true, required: true, trim: true},
      specificationId: {int: true, required: true, trim: true}
    };
  }
  addGoodsSpecificationAction() {
    this.allowMethods = 'post';
    this.rules = {
      goodsId: {int: true, required: true, trim: true},
      specificationId: {int: true, required: true, trim: true},
      value: {string: true, trim: true}
    };
  }
  deleteGoodsSpecificationAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, required: true, trim: true}
    };
  }
  updateGoodsSpecificationAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, required: true, trim: true},
      value: {string: true, required: true, trim: true}
    };
  }
  uploadGoodsSpecificationAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, required: true, trim: true},
      goodsId: {int: true, required: true, trim: true},
      img: {file: true, trim: true}
    };
  }
  addGoodsProductAction() {
    this.allowMethods = 'post';
    this.rules = {
      goodsId: {int: true, required: true, trim: true},
      goodsSpecificationIds: {string: true, required: true, trim: true},
      goodsNumber: {int: true, required: true, trim: true},
      retailPrice: {float: true, required: true, trim: true}
    };
  }
  deleteGoodsProductAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, required: true, trim: true}
    };
  }
  updateGoodsProductAction() {
    this.allowMethods = 'post';
    this.rules = {
      goodsId: {int: true, required: true, trim: true},
      goodsSpecificationIds: {string: true, required: true, trim: true},
      goodsNumber: {int: true, required: true, trim: true},
      retailPrice: {float: true, required: true, trim: true}
    };
  }
  getGoodsProductAction() {
    this.allowMethods = 'post';
    this.rules = {
      goodsId: {int: true, required: true, trim: true}
    };
  }
  getAttributeCategoryAction() {
    this.allowMethods = 'post';
    this.rules = {
    };
  }
  getAttributeByCategoryIdAction() {
    this.allowMethods = 'post';
    this.rules = {
      categoryId: {int: true, required: true, trim: true}
    };
  }
  addGoodsAttributeAction() {
    this.allowMethods = 'post';
    this.rules = {
      goodsId: {int: true, required: true, trim: true},
      attributeId: {int: true, required: true, trim: true},
      value: {string: true, required: true, trim: true}
    };
  }
  deleteGoodsAttributeAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, required: true, trim: true}
    };
  }
  updateGoodsAttributeAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, required: true, trim: true},
      attributeId: {int: true, required: true, trim: true},
      value: {string: true, required: true, trim: true}
    };
  }
  getGoodsAttributeAction() {
    this.allowMethods = 'post';
    this.rules = {
      goodsId: {int: true, required: true, trim: true}
    };
  }

  addGoodsIssueAction() {
    this.allowMethods = 'post';
    this.rules = {
      goodsId: {int: true, required: true, trim: true},
      question: {string: true, required: true, trim: true},
      answer: {string: true, required: true, trim: true}
    };
  }
  deleteGoodsIssueAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, required: true, trim: true}
    };
  }
  updateGoodsIssueAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, required: true, trim: true},
      question: {string: true, required: true, trim: true},
      answer: {string: true, required: true, trim: true}
    };
  }
  getGoodsIssueAction() {
    this.allowMethods = 'post';
    this.rules = {
      goodsId: {int: true, required: true, trim: true}
    };
  }

  uploadGoodsGalleryAction() {
    this.allowMethods = 'post';
    this.rules = {
      goodsId: {int: true, required: true, trim: true},
      imgDesc: {string: true, required: true, trim: true},
      sortOrder: {int: true, required: true, trim: true},
      img: {file: true, required: true, trim: true}
    };
  }
  deleteGoodsGalleryAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, required: true, trim: true}
    };
  }
  updateGoodsGalleryAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, required: true, trim: true},
      imgDesc: {string: true, required: true, trim: true},
      sortOrder: {int: true, required: true, trim: true}
    };
  }
  getGoodsGalleryAction() {
    this.allowMethods = 'post';
    this.rules = {
      goodsId: {int: true, required: true, trim: true}
    };
  }
};
