module.exports = class extends think.Logic {
  sendVerificationAction() {
    this.allowMethods = 'post';
    this.rules = {
      phone: {mobile: 'zh-CN', required: true, trim: true}
    };
  }
  validateVerificationAction() {
    this.allowMethods = 'post';
    this.rules = {
      phone: {mobile: 'zh-CN', trim: true},
      userId: {string: true, trim: true},
      requestId: {string: true, required: true, trim: true},
      code: {string: true, required: true, trim: true}
    };
  }
  getCityByPhoneAction() {
    this.allowMethods = 'post';
    this.rules = {
      phone: {mobile: 'zh-CN', required: true, trim: true}
    };
  }
};
