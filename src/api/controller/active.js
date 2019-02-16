const Base = require('./base.js');
const _ = require('lodash');
const rp = require('request-promise');

module.exports = class extends Base {
  async getActiveListAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const type = this.post('type');
    const token = await this.service('weixin').getToken(think.config('weixin.public_appid'), think.config('weixin.public_secret'));
    const options = {
      method: 'POST',
      url: 'https://api.weixin.qq.com/cgi-bin/material/batchget_material?access_token=' + _.values(token)[0],
      body: {
        'type': type,
        'offset': page - 1,
        'count': size
      },
      json: true
    };
    const sessionData = await rp(options);
    this.json(sessionData);
  }
};
