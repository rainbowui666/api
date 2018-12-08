module.exports = class extends think.Logic {
  listAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, trim: true},
      page: {int: true, trim: true},
      size: {int: true, trim: true}
    };
  }
  getAction() {
    this.allowMethods = 'post';
    this.rules = {
      billId: {int: true, required: true, trim: true}
    };
  }
  getCategoryListAction() {
    this.allowMethods = 'post';
    this.rules = {
      billId: {int: true, required: true, trim: true}
    };
  }
  getDetailByIdAction() {
    this.allowMethods = 'post';
    this.rules = {
      detailId: {int: true, required: true, trim: true}
    };
  }
  getDetailByBillIdAction() {
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, trim: true},
      size: {int: true, trim: true},
      billId: {int: true, required: true, trim: true},
      name: {string: true, trim: true}
    };
  }
  getDetailByBillIdAndCategoryAction() {
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, trim: true},
      size: {int: true, trim: true},
      billId: {int: true, required: true, trim: true},
      category: {string: true, required: true, trim: true},
      priceOrder: {string: true, trim: true}
    };
  }
  getDetailByBillIdAndRecommendAction() {
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, trim: true},
      size: {int: true, trim: true},
      billId: {int: true, required: true, trim: true},
      recommend: {string: true, required: true, trim: true}
    };
  }
  getDetailRecommendByBillIdAction() {
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, trim: true},
      size: {int: true, trim: true},
      billId: {int: true, required: true, trim: true}
    };
  }
  getDetailByBillIdAndTypeAction() {
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, trim: true},
      size: {int: true, trim: true},
      billId: {int: true, required: true, trim: true},
      type: {string: true, required: true, trim: true}
    };
  }
  getDetailByBillIdAndUndefineAction() {
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, trim: true},
      size: {int: true, trim: true},
      billId: {int: true, required: true, trim: true}
    };
  }
};
