module.exports = class extends think.Logic {
  listAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, trim: true},
      page: {int: true, trim: true},
      province: {string: true, trim: true},
      size: {int: true, trim: true}
    };
  }
  getAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, trim: true}
    };
  }
  myGroupListAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, trim: true},
      page: {int: true, trim: true},
      province: {string: true, trim: true},
      size: {int: true, trim: true}
    };
  }
  deliveryAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true},
      supplierFreight: {int: true, required: true, trim: true}
    };
  }
  payAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true},
      supplierConfirm: {int: true, required: true, trim: true}
    };
  }
  supplierConfirmAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true},
      supplierConfirm: {int: true, required: true, trim: true}
    };
  }
  updatePickupAddressAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true},
      pickupAddress: {string: true, required: true, trim: true}
    };
  }
  finishAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true}
    };
  }
  addAction() {
    this.allowMethods = 'post';
    this.rules = {
      name: {string: true, trim: true, required: true},
      endDate: {date: true, required: true},
      billId: {int: true, required: true, trim: true},
      freight: {float: true, required: true, trim: true},
      city: {string: true, trim: true, default: 'china'},
      province: {string: true, trim: true, default: 'china'},
      description: {string: true, trim: true, default: '这个团长很懒开团都不写描述。'},
      topFreight: {int: true, trim: true},
      private: {int: true, trim: true, default: 0}
    };
  }
  backAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true}
    };
  }
  nextAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true}
    };
  }
  groupEvidenceUploadAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true},
      img: {method: 'file', required: true}
    };
  }
  groupEvidenceListAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true}
    };
  }
  delayPickupDateAction() {
    this.allowMethods = 'post';
    this.rules = {
      groupId: {int: true, required: true, trim: true}
    };
  }
};
