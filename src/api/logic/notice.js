module.exports = class extends think.Logic {
  addAction() {
    this.allowMethods = 'post';
    this.rules = {
      noticeId: {int: true, required: true, trim: true}
    };
  }
  checkAction() {
    this.allowMethods = 'post';
    this.rules = {
      noticeId: {int: true, required: true, trim: true}
    };
  }
};
