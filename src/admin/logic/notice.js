module.exports = class extends think.Logic {
  publishAction() {
    this.allowMethods = 'post';
    this.rules = {
      img: {method: 'file', required: true}
    };
  }
};
