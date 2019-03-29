const Base = require('./base.js');

module.exports = class extends Base {
  async listAction() {
    const typeId = this.get('typeId');

    const list = await this.model('mall_collect')
      .field(['c.*', 'g.name', 'g.list_pic_url', 'g.goods_brief', 'g.retail_price'])
      .alias('c')
      .join({
        table: 'mall_goods',
        join: 'left',
        as: 'g',
        on: ['c.value_id', 'g.id']
      }).where({user_id: this.getLoginUserId(), type_id: parseInt(typeId)}).countSelect();

    return this.success(list);
  }

  async addordeleteAction() {
    const typeId = this.post('typeId');
    const valueId = this.post('valueId');

    const collect = await this.model('mall_collect').where({type_id: typeId, value_id: valueId, user_id: this.getLoginUserId()}).find();
    let collectRes = null;
    let handleType = 'add';
    if (think.isEmpty(collect)) {
      // 添加收藏
      collectRes = await this.model('mall_collect').add({
        type_id: typeId,
        value_id: valueId,
        user_id: this.getLoginUserId(),
        add_time: parseInt(new Date().getTime() / 1000)
      });
    } else {
      // 取消收藏
      collectRes = await this.model('mall_collect').where({id: collect.id}).delete();
      handleType = 'delete';
    }

    if (collectRes > 0) {
      return this.success({type: handleType});
    }

    return this.fail('操作失败');
  }
};
