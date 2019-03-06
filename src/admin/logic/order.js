module.exports = class extends think.Logic {
  returnAction() {
    this.allowMethods = 'post';
    this.rules = {
      orderId: {int: true, required: true, trim: true},
      userId: {int: true, required: true, trim: true},
      description: {string: true, required: true, trim: true}
    };
  }
};
