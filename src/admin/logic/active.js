module.exports = class extends think.Logic {
  addAction() {
    this.allowMethods = 'post';
    this.rules = {
      endDate: {date: true, required: true, trim: true},
      parentId: {int: true, required: true, trim: true},
      type: {string: true, required: true, trim: true},
      title: {string: true, required: true, trim: true},
      digest: {string: true, required: true, trim: true},
      url: {string: true, trim: true},
      content: {string: true, trim: true},
      target: {string: true, trim: true},
      isGoto: {int: true, trim: true}
    };
  }
  updateAction() {
    this.allowMethods = 'post';
    this.rules = {
      activeId: {int: true, required: true, trim: true},
      endDate: {date: true, required: true, trim: true},
      parentId: {int: true, required: true, trim: true},
      type: {string: true, required: true, trim: true},
      title: {string: true, required: true, trim: true},
      digest: {string: true, required: true, trim: true},
      url: {string: true, trim: true},
      content: {string: true, trim: true},
      target: {string: true, trim: true},
      isGoto: {int: true, trim: true}
    };
  }
  deleteAction() {
    this.allowMethods = 'post';
    this.rules = {
      activeId: {int: true, required: true, trim: true}
    };
  }
  uploadAction() {
    this.allowMethods = 'post';
    this.rules = {
      activeId: {int: true, required: true, trim: true},
      img: {method: 'file', required: true}
    };
  }
};
