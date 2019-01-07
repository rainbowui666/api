const Base = require('./base.js');
const _ = require('lodash');

module.exports = class extends Base {
  async addAction() {
    const share = {
      user_id: this.getLoginUserId(),
      param: this.post('param')
    };
    await this.model('share').add(share);
  }
  async selectAction() {
    const userId = this.post('userId');
    const param = this.post('param');
    const date = this.post('date');
    const deleteItem = this.post('delete');
    const sql = `select * from share where user_id=${userId} and param='${param}' and DATE_FORMAT(insert_date, '%Y-%m-%d')='${date}'`;
    const list = await this.model().query(sql);

    if (deleteItem) {
      _.each(list, (item) => {
        this.model('share').where({'id': item.id}).delete();
      });
    }
    this.json(list);
  }
};
