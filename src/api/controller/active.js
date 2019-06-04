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
  async getLastActiveAction() {
    const token = await this.service('weixin').getToken(think.config('weixin.public_appid'), think.config('weixin.public_secret'));
    const options = {
      method: 'POST',
      url: 'https://api.weixin.qq.com/cgi-bin/material/batchget_material?access_token=' + _.values(token)[0],
      body: {
        'type': 'news',
        'offset': 0,
        'count': 1
      },
      json: true
    };
    const sessionData = await rp(options);
    const userId = this.getLoginUserId();
    if (userId && sessionData.item && sessionData.item.length > 0) {
      const activeId = sessionData.item[0].media_id;
      const focus = await this.model('focus').where({active_id: activeId, user_id: userId}).find();
      if (think.isEmpty(focus)) {
        await this.model('focus').add({
          user_id: userId,
          active_id: activeId
        });
        return this.json({
          show: true,
          data: sessionData.item[0].content.news_item ? sessionData.item[0].content.news_item[0] : {}
        });
      } else {
        return this.json({
          show: false
        });
      }
    } else {
      return this.json({
        show: false
      });
    }
  }
};
