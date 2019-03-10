module.exports = class extends think.Logic {
  returnAction() {
    this.allowMethods = 'post';
    this.rules = {
      orderId: {int: true, required: true, trim: true},
      userId: {int: true, required: true, trim: true},
      description: {string: true, trim: true}
    };
  }
  listAction() {
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, required: true, trim: true},
      size: {int: true, required: true, trim: true},
      status: {string: true, trim: true}
    };
  }
  detailAction() {
    this.allowMethods = 'post';
    this.rules = {
      orderId: {int: true, required: true, trim: true}
    };
  }
  expressAction() {
    this.allowMethods = 'post';
    this.rules = {
      orderId: {int: true, required: true, trim: true}
    };
  }
  cancelAction() {
    this.allowMethods = 'post';
    this.rules = {
      orderId: {int: true, required: true, trim: true}
    };
  }
};
