module.exports = class extends think.Logic {
  getSubscriptionListAction() {
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, required: true, trim: true},
      size: {int: true, required: true, trim: true},
      type: {string: true, required: true, trim: true}
    };
  }
  getInformationByIdAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {string: true, required: true, trim: true}
    };
  }
};
