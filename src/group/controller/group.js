const Base = require('./base.js');
const moment = require('moment');
const _ = require('lodash');

// const { createCanvas } = require('canvas');
const fs = require('fs');
const images = require('images');

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
      group['pickup_date_format'] = this.service('date', 'api').convertWebDateToSubmitDateTime(group['pickup_date']);
      group['finish_date_format'] = this.service('date', 'api').convertWebDateToSubmitDateTime(group['finish_date']);
    }
    return this.json(group);
  }
  async deliveryAction() {
    const group = await this.model('group_bill').where({'id': this.post('groupId')}).find();
    const nextSetp = Number(group.current_step) + 1;
    await this.model('group_bill').where({'id': this.post('groupId')}).update({'supplier_freight': this.post('supplierFreight'), 'current_step': nextSetp});
    const updategroups = await this.model('group_bill').where({'id': this.post('groupId')}).find();
    updategroups['end_date_format'] = this.service('date', 'api').convertWebDateToSubmitDateTime(updategroups['end_date']);
    updategroups['pickup_date_format'] = this.service('date', 'api').convertWebDateToSubmitDateTime(updategroups['pickup_date']);
    updategroups['finish_date_format'] = this.service('date', 'api').convertWebDateToSubmitDateTime(updategroups['finish_date']);
    return this.success(updategroups);
  }
  async supplierConfirmAction() {
    const group = await this.model('group_bill').where({'id': this.post('groupId')}).find();
    const nextSetp = Number(group.current_step) + 1;
    await this.model('group_bill').where({'id': this.post('groupId')}).update({'supplier_confirm': this.post('supplierConfirm'), 'current_step': nextSetp});
    const updategroups = await this.model('group_bill').where({'id': this.post('groupId')}).find();
    updategroups['end_date_format'] = this.service('date', 'api').convertWebDateToSubmitDateTime(updategroups['end_date']);
    updategroups['pickup_date_format'] = this.service('date', 'api').convertWebDateToSubmitDateTime(updategroups['pickup_date']);
    updategroups['finish_date_format'] = this.service('date', 'api').convertWebDateToSubmitDateTime(updategroups['finish_date']);
    return this.success(updategroups);
  }
  async updatePickupAddressAction() {
    const group = await this.model('group_bill').where({'id': this.post('groupId')}).find();
    const nextSetp = Number(group.current_step) + 1;
    const date = moment().add(36, 'h').format('YYYY-MM-DD HH:mm:ss');
    const finishDate = this.service('date', 'api').convertWebDateToSubmitDateTime(date);
    const now = this.post('effortDate') ? this.service('date', 'api').convertWebDateToSubmitDateTime() : null;
    await this.model('group_bill').where({'id': this.post('groupId')}).update({'pickup_date': now, 'finish_date': finishDate, 'pickup_address': this.post('pickupAddress'), 'current_step': nextSetp});
    const updategroups = await this.model('group_bill').where({'id': this.post('groupId')}).find();
    updategroups['end_date_format'] = this.service('date', 'api').convertWebDateToSubmitDateTime(updategroups['end_date']);
    updategroups['pickup_date_format'] = this.service('date', 'api').convertWebDateToSubmitDateTime(updategroups['pickup_date']);
    updategroups['finish_date_format'] = this.service('date', 'api').convertWebDateToSubmitDateTime(updategroups['finish_date']);
    return this.success(updategroups);
  }
  async checkSupplierDeliveryAction() {
    await this.model('group_bill').where({'current_step': 3, 'supplier_freight': 0, 'pickup_date': ['<=', 'date_sub(now(), interval 36 hour)']}).update({
      'current_step': 7
    });
    // 退款
  }
  async checkSupplierConfirmAction() {
    await this.model('group_bill').where({'current_step': 6, 'supplier_freight': 0, 'pickup_date': ['<=', 'date_sub(now(), interval 24 hour)']}).update({
      'current_step': 7
    });
    // 打钱给团长
  }
  async delayPickupDateAction() {
    const date = moment().add(36, 'h').format('YYYY-MM-DD HH:mm:ss');
    const delayDate = this.service('date', 'api').convertWebDateToSubmitDateTime(date);
    await this.model('group_bill').where({'id': this.post('groupId')}).update({'pickup_date': delayDate});
    this.success('操作成功');
  }
  async activityAction() {
    this.json([
      {'code': 'default', 'name': '热团中', 'desc': ''},
      {'code': 'cx', 'name': '9月狂欢', 'desc': ''},
      {'code': 'jp', 'name': '精品推荐', 'desc': ''}
    ]);
  }
  async myGroupListAction() {
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
    this.json(list);
    return list;
  }
  async finishAction() {
    const endDate = this.service('date', 'api').convertWebDateToSubmitDateTime();
    await this.model('group_bill').where({id: this.post('groupId')}).update({status: 0, 'end_date': endDate, 'current_step': 1});
    const group = await this.model('group_bill').where({id: this.post('groupId')}).find();
    const model = this.model('cart').alias('c');
    model.field(['u.*']).join({
      table: 'user',
      join: 'inner',
      as: 'u',
      on: ['c.user_id', 'u.id']
    });
    const userList = await model.where({'u.openid': ['!=', null], 'c.sum': ['!=', 0], 'c.group_bill_id': this.post('groupId')}).select();
    const wexinService = this.service('weixin', 'api');
    const token = await wexinService.getToken();
    _.each(userList, (item) => {
      wexinService.sendFinishGroupMessage(_.values(token)[0], item, group);
    });
    this.success(true);
  }

  async addAction() {
    const user = this.getLoginUser();
    if (user.phone && user.phone === '18888888888') {
      this.fail('请在我的设置里修改正确的手机号');
    } else {
      const effortDate = this.service('date', 'api').convertWebDateToSubmitDateTime(this.post('endDate'));
      if (!moment(effortDate).isAfter(moment())) {
        this.fail('结束日期必须大于今天');
      } else {
        const group = {
          name: this.post('name'),
          contacts: user.name,
          phone: user.phone,
          end_date: moment(effortDate).format(this.config('date_format')),
          pickup_address: '',
          pickup_date: new Date(),
          pay_type: 0,
          pay_name: '',
          freight: this.post('freight'),
          description: this.post('description'),
          bill_id: this.post('billId'),
          user_id: user.id,
          city: this.post('city'),
          province: this.post('province'),
          private: this.post('private'),
          top_freight: this.post('topFreight')
        };
        const groupId = await this.model('group_bill').add(group);
        const city = await this.model('citys').where({'mark': this.post('city')}).find();
        group['id'] = groupId;
        group['city_name'] = city.name;
        const wexinService = this.service('weixin', 'api');
        const userList = await this.model('user').where({province: group.province, openid: ['!=', null]}).select();
        const token = await wexinService.getToken();
        _.each(userList, (item) => {
          wexinService.sendOpenGroupMessage(_.values(token)[0], item, group);
        });
      }
    }
  }

  async backAction() {
    const group = await this.model('group_bill').where({id: this.post('groupId')}).find();
    group.current_step = group.current_step - 1;
    await this.model('group_bill').where({id: this.post('groupId')}).update({current_step: group.current_step});
    this.success(true);
  }

  async nextAction() {
    const group = await this.model('group_bill').where({id: this.post('groupId')}).find();
    if (Number(group.status) === 1) {
      this.fail('请先结束团购');
    } else {
      group.current_step = group.current_step + 1;
      await this.model('group_bill').where({id: this.post('groupId')}).update({current_step: group.current_step});
    }
    this.success(true);
  }

  async groupEvidenceUploadAction() {
    const user = this.getLoginUser();
    if (user.type.indexOf('tz') >= 0) {
      const groupId = this.post('groupId');
      const img = this.file('file');
      const _name = img.name;
      const tempName = _name.split('.');
      let timestamp = Date.parse(new Date());
      timestamp = timestamp / 1000;
      const name = timestamp + '.' + tempName[1];
      const path = this.config('image.evidence') + '/' + name;
      const smallPath = this.config('image.evidence') + '/small/' + name;
      fs.renameSync(img.path, path);
      images(path + '').size(150).save(smallPath, {
        quality: 75
      });
      await this.model('damage_evidence').add({
        group_id: groupId,
        path: name
      });
      this.success(true);
    } else {
      this.fail('权限不足');
    }
  }

  async groupEvidenceListAction() {
    const groupId = this.post('groupId');
    const list = await this.model('damage_evidence').where({group_id: groupId}).select();
    this.json(list);
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
