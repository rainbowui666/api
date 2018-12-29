const Base = require('./base.js');
const _ = require('lodash');

module.exports = class extends Base {
  async listByGroupIdAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const groupId = this.post('groupId');
    const model = this.model('cart').alias('c');
    model.field(['c.*', 'g.name group_name', 'g.status group_status', 'u.name user_name', 'u.type user_type']).join({
      table: 'group_bill',
      join: 'inner',
      as: 'g',
      on: ['c.group_bill_id', 'g.id']
    }).join({
      table: 'user',
      join: 'inner',
      as: 'u',
      on: ['c.user_id', 'u.id']
    });
    const list = await model.where({'c.group_bill_id': groupId, 'c.is_confirm': 1, 'c.sum': ['!=', 0]}).order(['c.id DESC']).page(page, size).countSelect();
    _.each(list.data, (item) => {
      item['total'] = Number(item['sum']) + Number(item['freight']) - Number(item['lost_back']) - Number(item['damage_back']);
      if (item['user_type'] === 'lss' || item['user_type'] === 'lss') {
        item['is_group'] = false;
      } else {
        item['is_group'] = true;
      }
    });
    this.json(list);
  }
};
