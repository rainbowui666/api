module.exports = class extends think.Logic {
  upAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, required: true, trim: true}
    };
  }
  downAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, required: true, trim: true}
    };
  }
  deleteAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, required: true, trim: true}
    };
  }
  addAction() {
    this.allowMethods = 'post';
    this.rules = {
      app_list_pic_url: {string: true, trim: true},
      floor_price: {float: true, trim: true},
      is_new: {int: true, trim: true},
      is_show: {int: true, trim: true},
      list_pic_url: {string: true, trim: true},
      name: {string: true, required: true, trim: true},
      new_pic_url: {string: true, trim: true},
      new_sort_order: {int: true, trim: true},
      pic_url: {string: true, trim: true},
      simple_desc: {string: true, required: true, trim: true},
      sort_order: {int: true, trim: true}
    };
  }
  updateAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, required: true, trim: true},
      app_list_pic_url: {string: true, trim: true},
      floor_price: {float: true, trim: true},
      is_new: {int: true, trim: true},
      is_show: {int: true, trim: true},
      list_pic_url: {string: true, trim: true},
      name: {string: true, trim: true},
      new_pic_url: {string: true, trim: true},
      new_sort_order: {int: true, trim: true},
      pic_url: {string: true, trim: true},
      simple_desc: {string: true, required: true, trim: true},
      sort_order: {int: true, trim: true}
    };
  }
  uploadPicAction() {
    this.allowMethods = 'post';
    this.rules = {
      brandId: {int: true, required: true, trim: true},
      img: {method: 'file', required: true}
    };
  }
  uploadListPicAction() {
    this.allowMethods = 'post';
    this.rules = {
      brandId: {int: true, required: true, trim: true},
      img: {method: 'file', required: true}
    };
  }
  uploadAppListPicAction() {
    this.allowMethods = 'post';
    this.rules = {
      brandId: {int: true, required: true, trim: true},
      img: {method: 'file', required: true}
    };
  }
};
