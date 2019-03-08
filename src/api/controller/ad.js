
const Base = require('./base.js');
const fs = require('fs');
const _ = require('lodash');
module.exports = class extends Base {
  async getNumberAction() {
    const dir = think.config('image.ad') + '/' + this.post('province') + '/';
    const files = fs.readdirSync(dir);
    let maxId = 0;
    _.each(files, (itm) => {
      const filedId = itm.split('.')[0];
      if (Number(filedId) >= maxId) {
        maxId = Number(filedId);
      }
    });
    this.json({'ad_num': maxId});
  }
  async getIndexAction() {
    const list = this.model('mall_ad').where('id<10').select();
    const ad = {};
    for (const item of list) {
      const adArry = ad[item.ad_position_id] || [];
      ad[item.ad_position_id] = adArry.push(item);
    }
    return this.json(ad);
  }
  async getAdByPositionIdAction() {
    const positionId = this.post('positionId');
    const list = this.model('mall_ad').where({ad_position_id: positionId}).select();
    return this.json(list);
  }
};
