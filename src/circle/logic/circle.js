module.exports = class extends think.Logic {
  listByUserIdAction() {
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, trim: true},
      size: {int: true, trim: true}
    };
  }
  listByProvinceAction() {
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, trim: true},
      size: {int: true, trim: true},
      province: {string: true, required: true, trim: true}
    };
  }
  listByCommentAction() {
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, trim: true},
      size: {int: true, trim: true}
    };
  }
  listAction() {
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, trim: true},
      size: {int: true, trim: true}
    };
  }
  createAction() {
    this.allowMethods = 'post';
    this.rules = {
      type: {int: true, trim: true}
    };
  }
  addAction() {
    this.allowMethods = 'post';
    this.rules = {
      circleId: {int: true, required: true, trim: true},
      type: {int: true, trim: true},
      description: {string: true, trim: true}
    };
  }
  deleteAction() {
    this.allowMethods = 'post';
    this.rules = {
      circleId: {int: true, required: true, trim: true}
    };
  }
  getCircleByIdAction() {
    this.allowMethods = 'post';
    this.rules = {
      circleId: {int: true, required: true, trim: true}
    };
  }
  getCommentsAction() {
    this.allowMethods = 'post';
    this.rules = {
      circleId: {int: true, required: true, trim: true}
    };
  }
  praiseAction() {
    this.allowMethods = 'post';
    this.rules = {
      circleId: {int: true, required: true, trim: true}
    };
  }
  praiseListAction() {
    this.allowMethods = 'post';
    this.rules = {
      circleId: {int: true, required: true, trim: true}
    };
  }
  commentPostAction() {
    this.allowMethods = 'post';
    this.rules = {
      typeId: {int: true, required: true, trim: true},
      valueId: {int: true, required: true, trim: true},
      content: {string: true, required: true, trim: true}
    };
  }
  deleteImageAction() {
    this.allowMethods = 'post';
    this.rules = {
      circleImgId: {int: true, required: true, trim: true}
    };
  }
};
