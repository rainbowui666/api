module.exports = class extends think.Logic {
  listAction() {
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, trim: true},
      size: {int: true, trim: true},
      title: {string: true, trim: true},
      province: {string: true, required: true, trim: true}
    };
  }
  getByUserIdAction() {
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, trim: true},
      size: {int: true, trim: true},
      userId: {int: true, required: true, trim: true}
    };
  }
  getByIdAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, required: true, trim: true}
    };
  }
};
