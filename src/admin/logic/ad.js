module.exports = class extends think.Logic {
  uploadAction() {
    this.allowMethods = 'post';
    this.rules = {
      province: {string: true, required: true, trim: true},
      positionId: {int: true, required: true, trim: true},
      url: {string: true, trim: true},
      link: {string: true, trim: true},
      img: {file: true, trim: true}
    };
  }
  addAction() {
    this.allowMethods = 'post';
    this.rules = {
      province: {string: true, required: true, trim: true},
      positionId: {int: true, required: true, trim: true},
      url: {string: true, trim: true},
      link: {string: true, trim: true},
      content: {string: true, trim: true}
    };
  }
  getAdByPositionAction() {
    this.allowMethods = 'post';
    this.rules = {
      province: {string: true, required: true, trim: true},
      positionId: {int: true, required: true, trim: true}
    };
  }
  deleteAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, required: true, trim: true}
    };
  }
};
