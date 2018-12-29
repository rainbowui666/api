const Base = require('./base.js');
const moment = require('moment');

// const { createCanvas } = require('canvas');
// const fs = require('fs');
// const images = require('images');

module.exports = class extends Base {
  async listAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const name = this.post('name') || '';
    const province = this.post('province');
    const list = await this.model('group').getGroupList(name, page, size, province);
    return this.json(list);
  }
  async getAction() {
    const group = await this.model('group').getGroup(this.post('groupId'));
    if (group) {
      group['end_date_format'] = this.service('date', 'api').convertWebDateToSubmitDateTime(group['end_date']);
    }
    return this.json(group);
  }
  async deliveryAction() {
    const group = this.model('group').where({'id': this.post('groupId')}).find();
    const nextSetp = Number(group.current_step) + 1;
    await this.model('group').where({'id': this.post('groupId')}).update({'supplier_freight': this.post('supplierFreight'), 'current_step': nextSetp});
    return this.success('操作成功');
  }
  async supplierConfirmAction() {
    const group = this.model('group').where({'id': this.post('groupId')}).find();
    const nextSetp = Number(group.current_step) + 1;
    await this.model('group').where({'id': this.post('groupId')}).update({'supplier_confirm': this.post('supplierConfirm'), 'current_step': nextSetp});
    return this.success('操作成功');
  }
  async updatePickupAddressAction() {
    const group = this.model('group').where({'id': this.post('groupId')}).find();
    const nextSetp = Number(group.current_step) + 1;
    await this.model('group').where({'id': this.post('groupId')}).update({'supplier_confirm': this.post('supplierConfirm'), 'current_step': nextSetp});
    return this.success('操作成功');
  }
  async activityAction() {
    this.json([
      {'code': 'default', 'name': '热团中', 'desc': ''},
      {'code': 'cx', 'name': '9月狂欢', 'desc': ''},
      {'code': 'jp', 'name': '精品推荐', 'desc': ''}
    ]);
  }
  async userListAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const name = this.post('name') || '';
    const userId = this.getLoginUserId();
    const model = this.model('group_bill').alias('gb');
    const whereMap = {};
    if (!think.isEmpty(name)) {
      whereMap['gb.name'] = ['like', `%${name}%`];
    }
    if (!think.isEmpty(userId)) {
      whereMap['gb.user_id'] = userId;
    }
    const list = await model.field(['gb.*', '(select type from user where id=gb.user_id) user_type', 'date_format(gb.end_date, \'%Y-%m-%d %H:%i\') end_date_format', 'gb.bill_id billId', 'b.name bill_name', 'c.name city_name', 'p.name province_name', 'u.name supplier_name'])
      .join({
        table: 'citys',
        join: 'inner',
        as: 'c',
        on: ['gb.city', 'c.mark']
      })
      .join({
        table: 'provinces',
        join: 'inner',
        as: 'p',
        on: ['gb.province', 'p.code']
      })
      .join({
        table: 'bill',
        join: 'inner',
        as: 'b',
        on: ['gb.bill_id', 'b.id']
      })
      .join({
        table: 'user',
        join: 'inner',
        as: 'u',
        on: ['b.supplier_id', 'u.id']
      }).where(whereMap).order(['gb.status DESC', 'gb.id DESC', 'gb.end_date DESC']).page(page, size).countSelect();
    for (const item of list.data) {
      if (item['status'] !== 0) {
        if (moment(item['end_date']).isAfter(moment())) {
          item['status'] = 1;
        } else {
          item['status'] = 0;
          await this.model('group_bill').where({'id': item['id']}).update({'status': 0});
        }
      }
      const sumObj = await this.model('cart').field(['sum(sum) sum']).where({'group_bill_id': item['id'], 'is_confirm': 1}).find();
      item['sum'] = sumObj.sum || 0;
    }
    return list;
  }
  async payAction() {
  }
  async imageAction() {
    // const canvas = createCanvas(300, 120);
    // const ctx = canvas.getContext('2d');

    // ctx.font = '14px "Microsoft YaHei"';
    // ctx.fillStyle = '#ffffff';
    // ctx.fillText('', 50, 100);
    // ctx.fillText(this.getNewline('全国满200元起发货包装费20元按货单满2500元打88折'), 84, 24, 204);
    // fs.writeFileSync('/Users/tony/Documents/2.png', canvas.toBuffer());
    // images('/Users/tony/Documents/1.jpg').draw(images('/Users/tony/Documents/2.png'), 10, 50).save('/Users/tony/Documents/3.png');
  }
};
