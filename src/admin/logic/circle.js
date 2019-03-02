module.exports = class extends think.Logic {
  getByUserIdAction() {
    this.allowMethods = 'post';
    this.rules = {
      userid: {int: true, trim: true},
      type: {int: true, trim: true}
    };
  }
  listAction() {
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, trim: true},
      size: {int: true, trim: true}
    };
  }
  imagelistAction() {
    this.allowMethods = 'post';
    this.rules = {
      page: {int: true, trim: true},
      size: {int: true, trim: true}
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
  commentDeleteAction() {
    this.allowMethods = 'post';
    this.rules = {
      commentId: {int: true, required: true, trim: true}
    };
  }
  deleteImageAction() {
    this.allowMethods = 'post';
    this.rules = {
      circleImgId: {int: true, required: true, trim: true}
    };
  }
};
