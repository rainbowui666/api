
module.exports = class extends think.Model {
  /**
   * 获取用户根据id
   * @returns {Promise.<*>}
   */
  async getUser(userId) {
    const user = await this.where({id: userId}).find();
    return user;
  }

  async getPoint(userId) {
    const sql = `select  *  from user_point where user_id=${userId} and to_days(insert_date)=to_days(now())`;
    const point = await this.query(sql);
    return point;
  }
};
