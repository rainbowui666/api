module.exports = class extends think.Logic {
  loginByCodeAction() {
    this.allowMethods = 'post';
    this.rules = {
      code: { required: true, string: true }
    };
  }

  loginByPasswordAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: { required: true, string: true, trim: true },
      password: { required: true, string: true, trim: true },
      auth: { string: true, trim: true },
      requestId: { string: true },
      isError: { boolean: true }
    };
  }

  forgetPasswordAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: { required: true, string: true, trim: true },
      auth: { string: true, required: true, trim: true },
      requestId: { string: true, required: true },
      phone: {mobile: 'zh-CN', required: true, trim: true}
    };
  }

  registerAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, required: true, trim: true},
      password1: {string: true, required: true, trim: true, length: {min: 1, max: 20}},
      password2: {string: true, required: true, trim: true, length: {min: 1, max: 20}},
      phone: {mobile: 'zh-CN', required: true, trim: true},
      requestId: {string: true, required: true, trim: true},
      auth: {string: true, required: true, trim: true}
    };
  }

  loginByMiniProgramAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, required: true, trim: true},
      phone: {mobile: 'zh-CN', required: true, trim: true},
      avatarUrl: {string: true, required: true, trim: true},
      code: {string: true, required: true, trim: true}
    };
  }

  checkNameAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, required: true, trim: true}
    };
  }

  getAvatarAction() {
    this.rules = {
      userId: {int: true, required: true, trim: true}
    };
  }

  getLocationAvatar() {
    this.rules = {
      userId: {int: true, required: true, trim: true}
    };
  }

  getUserByTokenAction() {
    this.allowMethods = 'post';
    this.rules = {
      token: {string: true, required: true, trim: true}
    };
  }
  getByIdAction() {
    this.allowMethods = 'post';
    this.rules = {
      userId: { required: true, int: true, trim: true }
    };
  }
  updateAction() {
    this.allowMethods = 'post';
    this.rules = {
      city: {string: true, trim: true},
      province: {string: true, trim: true},
      phone: {mobile: 'zh-CN', trim: true},
      code: {string: true, trim: true},
      address: {string: true, trim: true},
      latitude: {string: true, trim: true},
      longitude: {string: true, trim: true},
      description: {string: true, trim: true},
      contacts: {string: true, trim: true},
      status: {int: true, trim: true},
      point: {int: true, trim: true}
    };
  }

  uploadAvatarAction() {
    this.allowMethods = 'post';
    this.rules = {
      avatar: {method: 'file', required: true}
    };
  }

  getByTypeAction() {
    this.allowMethods = 'post';
    this.rules = {
      type: { required: true, string: true, trim: true },
      city: { string: true, trim: true }
    };
  }

  decryptUserInfoDataAction() {
    this.rules = {
      code: { required: true, string: true, trim: true },
      encryptedData: { required: true, string: true, trim: true },
      iv: { required: true, string: true, trim: true }
    };
  }
};
