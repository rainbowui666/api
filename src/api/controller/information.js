
const Base = require('./base.js');
const _ = require('lodash');
const rp = require('request-promise');

module.exports = class extends Base {
  async getSubscriptionListAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const type = this.post('type');
    const token = await this.service('weixin').getToken(think.config('weixin.subscribe_appid'), think.config('weixin.subscribe_secret'));
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

  async getInformationByIdAction() {
    const id = this.post('id');
    const token = await this.service('weixin').getToken(think.config('weixin.subscribe_appid'), think.config('weixin.subscribe_secret'));
    const options = {
      method: 'POST',
      url: 'https://api.weixin.qq.com/cgi-bin/material/get_material?access_token=' + _.values(token)[0],
      body: {
        'media_id': id
      },
      json: true
    };
    const sessionData = await rp(options);
    this.json(sessionData);
  }
};
