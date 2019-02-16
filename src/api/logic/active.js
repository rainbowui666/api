module.exports = class extends think.Logic {
  getActiveListAction() {
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, required: true, trim: true},
      size: {int: true, required: true, trim: true},
      type: {string: true, required: true, trim: true}
    };
  }
};
