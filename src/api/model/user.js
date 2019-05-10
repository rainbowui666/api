
module.exports = class extends think.Model {
  /**
   * 获取用户根据id
   * @returns {Promise.<*>}
   */
  async getUser(userId) {
    const user = await this.where({id: userId}).find();
    return user;
  }

  async getPoint(userId, code) {
    const sql = `select  IFNULL(sum(point),0) point  from user_point where user_id=${userId} and type='${code}' and to_days(insert_date)=to_days(now())`;
    const point = await this.query(sql);
    return point;
  }
  async getTask(userId) {
    const sql = `select type,count(1) count from user_point where user_id=${userId} and to_days(insert_date)=to_days(now()) group by type`;
    const tasks = await this.query(sql);
    return tasks;
  }
};
