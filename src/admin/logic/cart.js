module.exports = class extends think.Logic {
  listByGroupIdAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true},
      page: {int: true, required: true, trim: true},
      size: {int: true, required: true, trim: true}
    };
  }
};
