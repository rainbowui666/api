module.exports = class extends think.Logic {
  addAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, required: true, trim: true},
      tag: {string: true, required: true, trim: true},
      description: {string: true, required: true, trim: true},
      price: {int: true, required: true, trim: true},
      priceCondition: {int: true, trim: true}
    };
  }
  updateAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, required: true, trim: true},
      name: {string: true, required: true, trim: true},
      tag: {string: true, required: true, trim: true},
      description: {string: true, required: true, trim: true},
      price: {int: true, required: true, trim: true},
      priceCondition: {int: true, trim: true}
    };
  }
  deleteAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, required: true, trim: true}
    };
  }
};
