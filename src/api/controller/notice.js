const Base = require('./base.js');
const fs = require('fs');
const _ = require('lodash');
module.exports = class extends Base {
  async addAction() {
    const notice = {
      user_id: this.getLoginUserId(),
      notice_id: this.post('noticeId')
    };
    await this.model('focus').add(notice);
  }

  async checkAction() {
    const notice = await this.model('focus').where({'user_id': this.getLoginUserId(), 'notice_id': this.post('noticeId')}).find();
    if (think.isEmpty(notice)) {
      this.json({'checked': true});
    } else {
      this.json({'checked': false});
    }
  }

  async getAction() {
    const dir = think.config('image.notice') + '/';
    const files = fs.readdirSync(dir);
    let maxId = 1;
    let defaultItem = '1.png';
    _.each(files, (itm) => {
      const filedId = itm.split('.')[0];
      if (Number(filedId) >= maxId) {
        maxId = Number(filedId);
        defaultItem = itm;
      }
    });
    this.json({'notice_file': 'https://static.huanjiaohu.com/image/notice/' + defaultItem, 'notice_id': maxId});
  }
};
