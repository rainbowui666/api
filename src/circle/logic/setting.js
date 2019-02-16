module.exports = class extends think.Logic {
  openAction() {
    this.allowMethods = 'post';
    this.rules = {
      title: {string: true, trim: true},
      bowlType: {string: true, required: true, trim: true},
      bowlFilter: {string: true, required: true, trim: true},
      bowlSystem: {string: true, required: true, trim: true},
      bowlSize: {string: true, required: true, trim: true}
    };
  }
  updateAction() {
    this.allowMethods = 'post';
    this.rules = {
      title: {string: true, trim: true},
      bowlType: {string: true, trim: true},
      bowlFilter: {string: true, trim: true},
      bowlSystem: {string: true, trim: true},
      bowlSize: {string: true, trim: true},
      bowlBrand: {string: true, trim: true},
      lightBrand: {string: true, trim: true},
      proteinType: {string: true, trim: true},
      streamType: {string: true, trim: true}
    };
  }
};
