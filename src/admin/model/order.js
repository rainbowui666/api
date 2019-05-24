
module.exports = class extends think.Model {
  deliveryOrderList() {
    return this.query(`SELECT * FROM mall_order  WHERE TO_DAYS(DATE_SUB(CURDATE(), INTERVAL 10 DAY)) - TO_DAYS(from_unixtime(add_time*1000)) <= 10 and order_status=202`);
  }
};
