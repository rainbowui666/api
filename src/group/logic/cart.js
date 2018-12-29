module.exports = class extends think.Logic {
  addAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true}
    };
  }
  getByGroupIdAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true}
    };
  }
  getCurrentCartByGroupIdAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true}
    };
  }
  damageAddAction() {
    this.allowMethods = 'post';
    this.rules = {
      cartId: {int: true, required: true, trim: true},
      billDetailId: {int: true, required: true, trim: true},
      billDetailNum: {int: true, required: true, trim: true}
    };
  }
  lostAddAction() {
    this.allowMethods = 'post';
    this.rules = {
      cartId: {int: true, required: true, trim: true},
      billDetailId: {int: true, required: true, trim: true},
      billDetailNum: {int: true, required: true, trim: true}
    };
  }
  lostSubAction() {
    this.allowMethods = 'post';
    this.rules = {
      cartId: {int: true, required: true, trim: true},
      billDetailId: {int: true, required: true, trim: true},
      billDetailNum: {int: true, required: true, trim: true}
    };
  }
  damageSubAction() {
    this.allowMethods = 'post';
    this.rules = {
      cartId: {int: true, required: true, trim: true},
      billDetailId: {int: true, required: true, trim: true},
      billDetailNum: {int: true, required: true, trim: true}
    };
  }
  addOrUpdateDetailAction() {
    this.allowMethods = 'post';
    this.rules = {
      cartId: {int: true, required: true, trim: true},
      billDetailId: {int: true, required: true, trim: true},
      billDetailNum: {int: true, required: true, trim: true},
      sum: {float: true, required: true, trim: true},
      freight: {float: true, required: true, trim: true}
    };
  }
  listAction() {
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, required: true, trim: true},
      size: {int: true, required: true, trim: true},
      userId: {int: true, trim: true}
    };
  }
  listByGroupIdAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true},
      page: {int: true, required: true, trim: true},
      size: {int: true, required: true, trim: true}
    };
  }
  getAction() {
    this.allowMethods = 'post';
    this.rules = {
      cartId: {int: true, required: true, trim: true}
    };
  }
  createOrderAction() {
    this.allowMethods = 'post';
    this.rules = {
      cartId: {int: true, required: true, trim: true}
    };
  }
};
