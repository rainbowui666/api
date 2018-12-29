module.exports = class extends think.Logic {
  listAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, trim: true},
      page: {int: true, trim: true},
      province: {string: true, trim: true},
      size: {int: true, trim: true}
    };
  }
  getAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, trim: true}
    };
  }
  userListAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, trim: true},
      page: {int: true, trim: true},
      province: {string: true, trim: true},
      size: {int: true, trim: true}
    };
  }
  deliveryAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true},
      supplierFreight: {int: true, required: true, trim: true}
    };
  }
  payAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true},
      supplierConfirm: {int: true, required: true, trim: true}
    };
  }
  supplierConfirmAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true},
      supplierConfirm: {int: true, required: true, trim: true}
    };
  }
  updatePickupAddressAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true},
      pickup_Address: {string: true, required: true, trim: true}
    };
  }
};
