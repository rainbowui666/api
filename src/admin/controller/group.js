const Base = require('./base.js');
const moment = require('moment');
const _ = require('lodash');
const xlsx = require('node-xlsx');
// const fs = require('fs');
module.exports = class extends Base {
  async userListAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const name = this.post('name') || '';
    const userId = this.getLoginUserId();
    const list = await this.model('group').getGroupList(name, page, size, userId);
    return this.json(list);
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
  async listAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const name = this.post('name') || '';
    const list = await this.model('group').getGroupList(name, page, size);
    return this.json(list);
  }
  async reopenAction() {
    const effortDate = this.service('date', 'api').convertWebDateToSubmitDateTime(this.post('endDate'));
    const endDate = moment(effortDate).add(1, 'days').format(this.config('date_format'));
    await this.model('group_bill').where({id: this.post('groupId')}).update({status: 1, end_date: endDate});
    this.success(true);
  }
  async privateQrAction() {
    const groupId = this.post('groupId');
    const qrService = this.service('qr', 'api');
    this.type = 'image/svg+xml';
    this.body = qrService.getGroupQrById(groupId, true);
  }
  async addGroupQrAction() {
    const billId = this.post('billId');
    const url = `https://group.huanjiaohu.com/#/group/add/${billId}`;
    const qrService = this.service('qr', 'api');
    this.type = 'image/svg+xml';
    this.body = qrService.getQrByUrl(url);
  }

  async deleteAction() {
    const billIdObject = await this.model('group_bill').field('bill_id').where({'id': this.post('groupId')}).find();
    const groupList = await this.model('group_bill').where({'bill_id': billIdObject.bill_id}).select();
    if (_.size(groupList) === 1) {
      await this.model('bill_detail').where({bill_id: billIdObject.bill_id}).delete();
      await this.model('bill').where({'id': billIdObject.bill_id}).delete();
    }
    await this.model('group').delete(this.post('groupId'));
    await this.model('cart').where({'group_bill_id': this.post('groupId')}).delete();
    await this.model('group_bill').where({'id': this.post('groupId')}).delete();
  }
  async addAction() {
    const user = this.getLoginUser();
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
      const userList = await this.model('user').where({province: group.province, public_openid: ['!=', null]}).select();
      const token = await wexinService.getToken(think.config('weixin.public_appid'), think.config('weixin.public_secret'));
      _.each(userList, (item) => {
        wexinService.sendOpenGroupMessage(_.values(token)[0], item, group);
      });
    }
  }
  async updateAction() {
    const group = this.model('group_bill').where({'id': this.post('groupId')}).find();
    const effortDate = this.service('date', 'api').convertWebDateToSubmitDateTime(this.post('endDate'));
    if (this.post('endDate') && !moment(effortDate).isAfter(moment())) {
      this.fail('结束日期必须大于今天');
    } else if (Number(group.status) === 0) {
      this.fail('已经结束的团购单不能更新');
    } else {
      await this.model('group_bill').where({id: this.post('groupId')}).update({
        name: this.post('name'),
        end_date: this.service('date', 'api').convertWebDateToSubmitDateTime(this.post('endDate')),
        freight: this.post('freight'),
        description: this.post('description'),
        city: this.post('city'),
        province: this.post('province'),
        private: this.post('private'),
        top_freight: this.post('topFreight'),
        activity_code: this.post('activityCode'),
        status: this.post('status')
      });
      this.success(true);
    }
  }
  async downloadAction() {
    const group = await this.model('group_bill').where({'id': this.get('groupId')}).find();
    const returnData = [['序号', '昵称', '联系电话', '备注', '合计', '品名', '规格', '单价', '数量', '共计（不含运费)']];
    const totleReturnData = [['品名', '规格', '单价', '数量', '共计（不含运费)']];
    const totleReturnDataWithfreight = [['品名', '规格', '单价', '数量', '生物总价', '生物运费', '缺货退费', '报损退费', '共计（含运费)']];
    const returnDataWithfreight = [['序号', '昵称', '联系电话', '备注', '合计', '品名', '规格', '单价', '实际数量', '缺货数量', '报损数量', '缺货退款（含运费)', '报损退款', '应退款（含运费)', '应收款（含运费)']];
    const detailGroups = await this.model('group').detailGroup(this.get('groupId'));
    const summaryGroups = await this.model('group').summaryGroup(this.get('groupId'));
    let totleSum = 0;
    let totleSumWithfreight = 0;
    _.each(summaryGroups, (summaryGroup) => {
      const _itemList = [];
      const _itemListWithfreight = [];
      _itemList.push(summaryGroup.name);
      _itemListWithfreight.push(summaryGroup.name);
      _itemList.push(summaryGroup.size);
      _itemListWithfreight.push(summaryGroup.size);
      _itemList.push(summaryGroup.price);
      _itemListWithfreight.push(summaryGroup.price);
      _itemList.push(summaryGroup.bill_detail_num);
      _itemListWithfreight.push(summaryGroup.bill_detail_num);
      _itemList.push(summaryGroup.sum);
      _itemListWithfreight.push(summaryGroup.sum);
      _itemListWithfreight.push(Number(summaryGroup.sum_freight) - Number(summaryGroup.sum_lost_back_freight));
      _itemListWithfreight.push('-' + (summaryGroup.sum_lost_back + Number(summaryGroup.sum_lost_back_freight)));
      _itemListWithfreight.push('-' + summaryGroup.sum_damage_back);
      const sum = Number(summaryGroup.sum) + Number(summaryGroup.sum_freight) - Number(summaryGroup.sum_lost_back_freight);
      _itemListWithfreight.push(sum);
      totleSum += summaryGroup.sum;
      totleSumWithfreight += sum;
      totleReturnData.push(_itemList);
      totleReturnDataWithfreight.push(_itemListWithfreight);
    });
    const _itemList = [];
    _itemList.push('');
    _itemList.push('');
    _itemList.push('');
    _itemList.push('共计');
    _itemList.push(totleSum);
    totleReturnData.push(_itemList);

    const _itemListWithfreight = [];
    _itemListWithfreight.push('');
    _itemListWithfreight.push('');
    _itemListWithfreight.push('');
    _itemListWithfreight.push('');
    _itemListWithfreight.push('');
    _itemListWithfreight.push('');
    _itemListWithfreight.push('');
    _itemListWithfreight.push('共计');
    _itemListWithfreight.push(totleSumWithfreight);
    totleReturnDataWithfreight.push(_itemListWithfreight);

    const tempMap = new Map();
    // const rangeList = [];
    _.each(detailGroups, (detailGroup) => {
      const itemList = tempMap.get(detailGroup.userName);
      if (itemList) {
        itemList.push(detailGroup);
      } else {
        const list = [detailGroup];
        tempMap.set(detailGroup.userName, list);
      }
    });
    let secquence = 1;
    tempMap.forEach((itemList, key, map) => {
      const _count = this.count(itemList);
      _.each(itemList, (item, index) => {
        const _itemList = [];
        const _itemListWithfreight = [];
        // const lostBack = Number(item.lost_num) * Number(item.price) + Number(item.lost_back_freight);
        // const damageBack = Number(item.damage_num) * Number(item.price);
        if (index === 0) {
          _itemList.push(secquence);
          _itemList.push(item.userName);
          _itemList.push(item.phone);
          _itemList.push(item.description);
          _itemList.push(_count);
          _itemListWithfreight.push(secquence);
          _itemListWithfreight.push(item.userName);
          _itemListWithfreight.push(item.phone);
          _itemListWithfreight.push(item.description);
          _itemListWithfreight.push(Number(_count) + Number(item.freight) - Number(item.lost_back_freight));
          secquence++;
        } else {
          _itemList.push('');
          _itemList.push('');
          _itemList.push('');
          _itemList.push('');
          _itemList.push('');
          _itemListWithfreight.push('');
          _itemListWithfreight.push('');
          _itemListWithfreight.push('');
          _itemListWithfreight.push('');
          _itemListWithfreight.push('');
        }
        _itemList.push(item.name);
        _itemList.push(item.size);
        _itemList.push(item.price);
        _itemList.push(item.bill_detail_num);
        _itemList.push(item.sum);

        _itemListWithfreight.push(item.name);
        _itemListWithfreight.push(item.size);
        _itemListWithfreight.push(item.price);
        _itemListWithfreight.push(item.bill_detail_num);
        _itemListWithfreight.push(item.lost_num);
        _itemListWithfreight.push(item.damage_num);
        const lostBackItem = Number(item.lost_num) * Number(item.price) + Number(item.lost_back_freight);
        const damageBackItem = Number(item.damage_num) * Number(item.price);
        _itemListWithfreight.push('-' + lostBackItem);
        _itemListWithfreight.push('-' + damageBackItem);
        _itemListWithfreight.push('-' + (lostBackItem + damageBackItem));
        const itemCount = Number(item.bill_detail_num) * Number(item.price) + Number(item.freight) - Number(item.lost_back_freight);
        _itemListWithfreight.push(itemCount);

        returnData.push(_itemList);
        returnDataWithfreight.push(_itemListWithfreight);
      });
      returnData.push([]);
      returnDataWithfreight.push([]);
    });
    const name = 'coral123-' + group.id + '.xlsx';
    // const buffer = xlsx.build([
    //   {name: '总单(不含运费)', data: totleReturnData},
    //   {name: '明细(不含运费)', data: returnData},
    //   {name: '总单(含运费)', data: totleReturnDataWithfreight},
    //   {name: '明细(含运费)', data: returnDataWithfreight}
    // ]);
    const buffer = xlsx.build([
      {name: '明细(不含运费)', data: returnData},
      {name: '总单(不含运费)', data: totleReturnData}
    ]);
    this.type = 'application/vnd.ms-excel';
    this.ctx.attachment(name);
    this.body = buffer;
  }

  count(itemList) {
    let sum = 0;
    _.each(itemList, (item) => {
      sum += item.sum;
    });
    return sum;
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
    const userList = await model.where({'u.public_openid': ['!=', null], 'c.sum': ['!=', 0], 'c.group_bill_id': this.post('groupId')}).select();
    const wexinService = this.service('weixin', 'api');
    const token = await wexinService.getToken(think.config('weixin.public_appid'), think.config('weixin.public_secret'));
    _.each(userList, (item) => {
      wexinService.sendFinishGroupMessage(_.values(token)[0], item, group);
    });
    this.success(true);
  }
};
