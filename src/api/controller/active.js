const Base = require('./base.js');
const moment = require('moment');

module.exports = class extends Base {
  async getActiveListAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const type = this.post('type');
    const whereMap = {};
    if (!think.isEmpty(type)) {
      whereMap['type'] = type;
    }
    whereMap['parent_id'] = 0;
    const list = await this.model('active').where(whereMap).order(['id DESC']).page(page, size).countSelect();
    const service = this.service('date', 'api');
    const activeList = [];
    for (const active of list.data) {
      const activeObj = {};
      activeObj['content'] = {};
      const actives = [];
      active['end_date_format'] = service.convertWebDateToSubmitDateTime(active['end_date']);
      if (moment(active['end_date']).isAfter(moment())) {
        active['status'] = 1;
      } else {
        active['status'] = 0;
      }
      actives.push(active);
      const subList = await this.model('active').where({parent_id: active.id}).select();
      activeObj['content']['news_item'] = actives.concat(subList);
      activeList.push(activeObj);
    }
    this.json(activeList);
  }
};
