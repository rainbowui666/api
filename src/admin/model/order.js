
module.exports = class extends think.Model {
  deliveryOrderList() {
    return this.query(`SELECT * FROM mall_order  WHERE  TO_DAYS(CURDATE()) - TO_DAYS(from_unixtime(add_time*1000)) > 5 and order_status=202`);
  }
  outputList(year, month) {
    const sql = `SELECT order_sn,consignee,(select name from region where id=province) province,freight_price,DATE_FORMAT(from_unixtime(add_time*1000),'%Y-%m-%d %H:%i:%s') add_time,actual_price,out_price,actual_price-out_price income,note from mall_order where order_status in ('201','202', '203') and  DATE_FORMAT(from_unixtime(add_time*1000),'%m')='${month}' and YEAR(from_unixtime(add_time*1000))=${year}`;
    return this.query(sql);
  }
};
