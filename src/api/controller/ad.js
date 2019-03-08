
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
    const province = this.post('province');
    let china = await this.model('mall_ad').where({ad_position_id: ['<', 10], province: 'china'}).select();
    const provinceList = await this.model('mall_ad').where({ad_position_id: ['<', 10], province}).select() || [];
    china = china.concat(provinceList);
    const ad = {};
    _.each(china, (item) => {
      const key = item.ad_position_id + '';
      const adArry = ad[key];
      if (adArry && adArry.length > 0) {
        adArry.push(item);
      } else {
        ad[key] = [item];
      }
    });
    return this.json(ad);
  }
  async getAdByPositionIdAction() {
    const positionId = this.post('positionId');
    const list = await this.model('mall_ad').where({ad_position_id: positionId}).select();
    return this.json(list);
  }
};
