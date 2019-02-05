module.exports = class extends think.Logic {
  postAction() {
    this.allowMethods = 'post';
    this.rules = {
      typeId: {int: true, required: true, trim: true},
      valueId: {int: true, required: true, trim: true},
      content: {string: true, required: true, trim: true}
    };
  }
};
