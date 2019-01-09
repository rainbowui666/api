module.exports = class extends think.Logic {
  getCartListAction() {
    this.allowMethods = 'post';
    this.rules = {
      userId: { required: true, int: true, trim: true }
    };
  }
  deleteCartAction() {
    this.allowMethods = 'post';
    this.rules = {
      cartId: { required: true, int: true, trim: true }
    };
  }

  getLikeMaterialAction() {
    this.allowMethods = 'post';
    this.rules = {
      userId: { required: true, int: true, trim: true }
    };
  }

  updateAction() {
    this.allowMethods = 'post';
    this.rules = {
      userId: {int: true, required: true, trim: true},
      city: {string: true, trim: true},
      province: {string: true, trim: true},
      phone: {mobile: 'zh-CN', trim: true},
      type: {array: true, trim: true},
      code: {string: true, trim: true},
      address: {string: true, trim: true},
      description: {string: true, trim: true},
      contacts: {string: true, trim: true},
      status: {int: true, trim: true},
      point: {int: true, trim: true}
    };
  }

  listAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, trim: true},
      page: {int: true, trim: true},
      size: {int: true, trim: true},
      city: {string: true, trim: true},
      province: {string: true, trim: true},
      type: {string: true, trim: true},
      isPhone: {boolean: true, trim: true}
    };
  }

  addTypeAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, required: true, trim: true},
      code: {string: true, required: true, trim: true},
      description: {string: true, trim: true}
    };
  }

  addUserTypeRelationAction() {
    this.allowMethods = 'post';
    this.rules = {
      userId: {int: true, required: true, trim: true},
      typeId: {int: true, required: true, trim: true}
    };
  }

  deleteUserTypeRelationAction() {
    this.allowMethods = 'post';
    this.rules = {
      userId: {int: true, required: true, trim: true},
      typeId: {int: true, required: true, trim: true}
    };
  }

  updateTypeAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, required: true, trim: true},
      name: {string: true, required: true, trim: true},
      code: {string: true, required: true, trim: true},
      description: {string: true, trim: true}
    };
  }
};
