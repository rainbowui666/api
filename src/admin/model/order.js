
module.exports = class extends think.Model {
  deliveryOrderList() {
    return this.query(`SELECT * FROM mall_order  WHERE  TO_DAYS(CURDATE()) - TO_DAYS(from_unixtime(add_time*1000)) > 5 and order_status=202`);
  }
};
