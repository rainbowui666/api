module.exports = class extends think.Logic {
  addAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, required: true, trim: true},
      ename: {string: true, trim: true},
      sname: {string: true, trim: true},
      category: {string: true, required: true, trim: true},
      type: {string: true, required: true, trim: true},
      tag: {string: true, trim: true},
      code: {string: true, required: true, trim: true},
      level: {string: true, required: true, trim: true},
      price: {int: true, required: true, trim: true},
      compatibility: {string: true, required: true, trim: true},
      description: {string: true, required: true, trim: true},
      classification: {int: true, trim: true, default: 0}
    };
  }
  updateAction() {
    this.allowMethods = 'post';
    this.rules = {
      materialId: {int: true, required: true, trim: true},
      name: {string: true, required: true, trim: true},
      ename: {string: true, trim: true},
      sname: {string: true, trim: true},
      category: {string: true, required: true, trim: true},
      type: {string: true, required: true, trim: true},
      tag: {string: true, trim: true},
      code: {string: true, required: true, trim: true},
      level: {string: true, required: true, trim: true},
      price: {int: true, required: true, trim: true},
      compatibility: {string: true, required: true, trim: true},
      description: {string: true, required: true, trim: true},
      classification: {int: true, trim: true, default: 0}
    };
  }
  uploadAction() {
    this.allowMethods = 'post';
    this.rules = {
      code: {string: true, required: true, trim: true},
      category: {string: true, required: true, trim: true},
      img: {method: 'file', required: true}
    };
  }
  deleteAction() {
    this.allowMethods = 'post';
    this.rules = {
      materialId: {int: true, required: true, trim: true}
    };
  }
  deleteImageAction() {
    this.allowMethods = 'post';
    this.rules = {
      materialId: {int: true, required: true, trim: true},
      imgName: {string: true, required: true, trim: true}
    };
  }
  focusAction() {
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, trim: true},
      size: {int: true, trim: true},
      materialId: {int: true, required: true, trim: true}
    };
  }
};
