module.exports = class extends think.Logic {
  openAction() {
    this.allowMethods = 'post';
    this.rules = {
      title: {string: true, required: true, trim: true},
      type: {string: true, required: true, trim: true},
      filter: {string: true, required: true, trim: true},
      bowlSystem: {string: true, required: true, trim: true},
      size: {string: true, required: true, trim: true}
    };
  }
  updateAction() {
    this.allowMethods = 'post';
    this.rules = {
      title: {string: true, trim: true},
      type: {string: true, trim: true},
      filter: {string: true, trim: true},
      bowlSystem: {string: true, trim: true},
      size: {string: true, trim: true},
      bowlBrand: {string: true, trim: true},
      lightBrand: {string: true, trim: true},
      proteinType: {string: true, trim: true},
      streamType: {string: true, trim: true}
    };
  }
};
