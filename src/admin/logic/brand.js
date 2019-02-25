module.exports = class extends think.Logic {
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
      floor_price: {int: true, trim: true},
      is_new: {int: true, trim: true},
      is_show: {int: true, trim: true},
      list_pic_url: {string: true, trim: true},
      name: {string: true, required: true, trim: true},
      new_pic_url: {string: true, trim: true},
      new_sort_order: {int: true, trim: true},
      pic_url: {string: true, trim: true},
      simple_desc: {string: true, trim: true},
      sort_order: {int: true, trim: true}
    };
  }
  updateAction() {
    this.allowMethods = 'post';
    this.rules = {
      id: {int: true, required: true, trim: true},
      app_list_pic_url: {string: true, trim: true},
      floor_price: {int: true, trim: true},
      is_new: {int: true, trim: true},
      is_show: {int: true, trim: true},
      list_pic_url: {string: true, trim: true},
      name: {string: true, trim: true},
      new_pic_url: {string: true, trim: true},
      new_sort_order: {int: true, trim: true},
      pic_url: {string: true, trim: true},
      simple_desc: {string: true, trim: true},
      sort_order: {int: true, trim: true}
    };
  }
};