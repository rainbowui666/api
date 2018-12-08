const moment = require('moment');

module.exports = class extends think.Model {
  delete(id) {
    this.execute(`delete from cart_detail where cart_id in (select id from (select c.id from cart c where c.group_bill_id=${id}) cartid)`);
  }
  summaryGroup(id) {
    return this.query(`select bd.name,bd.size,bd.price,sum(bill_detail_num) bill_detail_num,sum((bd.price*cd.bill_detail_num)) sum,sum(cd.freight) sum_freight,sum(cd.lost_back_freight) sum_lost_back_freight,sum((bd.price*cd.lost_num)) sum_lost_back,sum((bd.price*cd.damage_num)) sum_damage_back from cart c,cart_detail cd,bill_detail bd where c.is_confirm=1 and c.sum!=0 and c.id=cd.cart_id  and cd.bill_detail_id=bd.id and c.group_bill_id=${id} group by name,size,price`);
  }
  countGroupMaterialList(from, to, limit = 10, category = 'hy') {
    return this.query(`select m.id,count(m.id) count,m.name,m.tag from bill b,group_bill g,bill_detail bd,material m where g.bill_id=b.id and bd.bill_id=b.id and bd.material_id=m.id and m.category='${category}' and   g.end_date < now() and g.end_date BETWEEN '${from}' AND DATE_ADD('${to}',INTERVAL 1 DAY) group by m.id order by count desc limit ${limit}`);
  }
  countGroupSupplierList(from, to, userId, limit = 10) {
    return this.query(`select b.supplier_id user_id,count(b.supplier_id) count, sum(c.sum+c.freight-c.lost_back-c.damage_back) value,(select u.name from user u where u.id=b.supplier_id) name  from bill b,group_bill g,cart c where c.group_bill_id=g.id and g.bill_id=b.id and  g.end_date < now() and b.supplier_id !=32 and ${userId ? 'g.user_id=' + userId : '1=1'} and g.end_date BETWEEN '${from}' AND DATE_ADD('${to}',INTERVAL 1 DAY) group by b.supplier_id order by count desc limit ${limit}`);
  }
  countGroupUserList(from, to, userId, limit = 10) {
    return this.query(`select c.user_id,count(c.user_id) count,sum(c.sum+c.freight-c.lost_back-c.damage_back) sum,(select u.name from user u where u.id=c.user_id) name  from cart c,group_bill g where  g.id=c.group_bill_id and  g.end_date < now() and  ${userId ? 'g.user_id=' + userId : '1=1'} and g.end_date BETWEEN '${from}' AND DATE_ADD('${to}',INTERVAL 1 DAY) group by c.user_id order by sum desc limit ${limit}`);
  }
  countGroup(from, to, userId) {
    return this.query(`select date_format(g.end_date, '%Y-%m') date,IFNULL(count(g.id),0) count from group_bill g where   ${userId ? 'g.user_id=' + userId : '1=1'} and g.end_date  BETWEEN '${from}' AND DATE_ADD('${to}',INTERVAL 1 DAY) group by date_format(g.end_date, '%Y-%m')`);
  }
  sumGroup(from, to, userId) {
    return this.query(`select date_format(g.end_date, '%Y-%m') date,IFNULL(sum(c.sum+c.freight-c.lost_back-c.damage_back),0) sum from cart c,group_bill g where  g.id=c.group_bill_id  and  ${userId ? 'g.user_id=' + userId : '1=1'} and g.end_date  BETWEEN '${from}' AND DATE_ADD('${to}',INTERVAL 1 DAY) group by date_format(g.end_date, '%Y-%m')`);
  }
  sumThisWeekGroup(userId) {
    return this.query(`select IFNULL(sum(c.sum+c.freight-c.lost_back-c.damage_back),0) sum from cart c,group_bill g where  g.id=c.group_bill_id  and  g.end_date < now() and  ${userId ? 'g.user_id=' + userId : '1=1'} and YEARWEEK(date_format(c.insert_date,'%Y-%m-%d')) = YEARWEEK(now())`);
  }
  sumLastWeekGroup(userId) {
    return this.query(`select IFNULL(sum(c.sum+c.freight-c.lost_back-c.damage_back),0)sum from cart c,group_bill g where  g.id=c.group_bill_id  and  g.end_date < now() and  ${userId ? 'g.user_id=' + userId : '1=1'} and YEARWEEK(date_format(c.insert_date,'%Y-%m-%d')) = YEARWEEK(now())-1`);
  }
  sumThisMonthGroup(userId) {
    return this.query(`select IFNULL(sum(c.sum+c.freight-c.lost_back-c.damage_back),0) sum from cart c,group_bill g where  g.id=c.group_bill_id and  g.end_date < now() and  ${userId ? 'g.user_id=' + userId : '1=1'} and DATE_FORMAT( c.insert_date, '%Y%m' ) = DATE_FORMAT( now(), '%Y%m' )`);
  }
  sumLastMonthGroup(userId) {
    return this.query(`select IFNULL(sum(c.sum+c.freight-c.lost_back-c.damage_back),0) sum from cart c,group_bill g where  g.id=c.group_bill_id  and  g.end_date < now() and  ${userId ? 'g.user_id=' + userId : '1=1'} and DATE_FORMAT( c.insert_date, '%Y%m' ) = DATE_FORMAT( DATE_SUB(now(), INTERVAL 1 YEAR), '%Y%m' )`);
  }
  detailGroup(id) {
    const detailGroup = `select IFNULL(u.nickname,u.name) userName,u.phone,u.contacts,(select name from citys where mark=u.province) province,(select name from citys where mark=u.city) city,if(u.address='null','',u.address) address,if(c.description='null','',c.description) description,bd.name,bd.size,bd.price,cd.bill_detail_num,(bd.price*cd.bill_detail_num) sum,cd.freight,cd.lost_back_freight,cd.lost_num,cd.damage_num from cart c,cart_detail cd,bill_detail bd,user u where c.is_confirm=1 and c.sum!=0 and c.id=cd.cart_id and c.user_id=u.id and cd.bill_detail_id=bd.id and c.group_bill_id=${id} order by c.id asc`;
    return this.query(detailGroup);
  }
  async getUserGroupList({name, page, size, userId}) {
    const model = this.model('group_bill').alias('gb');
    const whereMap = {};
    if (!think.isEmpty(name)) {
      whereMap['gb.name'] = ['like', `%${name}%`];
    }
    if (!think.isEmpty(userId)) {
      whereMap['gb.user_id'] = userId;
    }
    const list = await model.field(['gb.*', '(select type from user where id=gb.user_id) user_type', 'date_format(gb.end_date, \'%Y-%m-%d %H:%i\') end_date_format', 'gb.bill_id billId', 'b.name bill_name', 'c.name city_name', 'p.name province_name', 'u.name supplier_name'])
      .join({
        table: 'citys',
        join: 'inner',
        as: 'c',
        on: ['gb.city', 'c.mark']
      })
      .join({
        table: 'provinces',
        join: 'inner',
        as: 'p',
        on: ['gb.province', 'p.code']
      })
      .join({
        table: 'bill',
        join: 'inner',
        as: 'b',
        on: ['gb.bill_id', 'b.id']
      })
      .join({
        table: 'user',
        join: 'inner',
        as: 'u',
        on: ['b.supplier_id', 'u.id']
      }).where(whereMap).order(['gb.id DESC', 'gb.end_date DESC']).page(page, size).countSelect();
    for (const item of list.data) {
      if (item['status'] !== 0) {
        if (moment(item['end_date']).isAfter(moment())) {
          item['status'] = 1;
        } else {
          item['status'] = 0;
        }
      }
      const sumObj = await this.model('cart').field(['sum(sum+freight-lost_back-damage_back) sum']).where({'group_bill_id': item['id'], 'is_confirm': 1}).find();
      item['sum'] = sumObj.sum || 0;
    }
    return list;
  }
  async getGroup(id) {
    const model = this.model('group_bill').alias('gb');
    const group = await model.field(['gb.*', 'c.name city', 'p.name province', 'u.name supplier_name'])
      .join({
        table: 'citys',
        join: 'inner',
        as: 'c',
        on: ['gb.city', 'c.mark']
      })
      .join({
        table: 'provinces',
        join: 'inner',
        as: 'p',
        on: ['gb.province', 'p.code']
      })
      .join({
        table: 'bill',
        join: 'inner',
        as: 'b',
        on: ['gb.bill_id', 'b.id']
      })
      .join({
        table: 'user',
        join: 'inner',
        as: 'u',
        on: ['b.supplier_id', 'u.id']
      }).where({'gb.id': id}).order(['gb.id DESC', 'gb.end_date DESC']).find();

    if (group['status'] !== 0) {
      if (moment(group['end_date']).isAfter(moment())) {
        group['status'] = 1;
      } else {
        group['status'] = 0;
      }
    }
    const sumObj = await this.model('cart').field(['sum(sum+freight-lost_back-damage_back) sum']).where({'group_bill_id': group['id'], 'is_confirm': 1}).find();
    group['sum'] = sumObj.sum || 0;
    return group;
  }
};
