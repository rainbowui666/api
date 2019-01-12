module.exports = class extends think.Logic {
  addAction() {
    this.allowMethods = 'post';
    this.rules = {
      title: {string: true, required: true, trim: true},
      description: {string: true, required: true, trim: true},
      province: {string: true, required: true, trim: true},
      location: {string: true, required: true, trim: true},
      userId: {int: true, required: true, trim: true},
      longitude: {float: true, required: true, trim: true},
      latitude: {float: true, required: true, trim: true},
      type: {string: true, required: true, trim: true},
      scope: {int: true, trim: true}
    };
  }

  updateAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, required: true, trim: true},
      title: {string: true, required: true, trim: true},
      description: {string: true, required: true, trim: true},
      province: {string: true, required: true, trim: true},
      location: {string: true, required: true, trim: true},
      longitude: {float: true, required: true, trim: true},
      latitude: {float: true, required: true, trim: true},
      type: {string: true, required: true, trim: true},
      scope: {int: true, trim: true}
    };
  }
  deleteAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, required: true, trim: true}
    };
  }
  listAction() {
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, trim: true},
      size: {int: true, trim: true},
      title: {string: true, trim: true},
      province: {string: true, trim: true}
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
