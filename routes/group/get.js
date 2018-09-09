const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const util = require('../../lib/util.js');
const _ = require("lodash");

module.exports = {
    path: '/api/group/get',
    method: 'GET',
    handler(request, reply) {
        const select = `select g.activity_code,g.top_freight, g.current_step, g.private,g.id,g.name,g.city,g.province,g.contacts,g.phone, date_format(g.end_date , '%Y-%m-%d %H:%i:%s') end_date,u.name supplierName,g.pickup_address,date_format(g.pickup_date , '%Y-%m-%d %H:%i:%s') pickup_date,g.pay_type,g.pay_count,g.pay_name,g.pay_description,g.freight,g.description,g.isflash is_flash,g.flash_desc,g.bill_id,g.user_id,(select type from user where id=g.user_id) user_type,if(g.status>0,if(TIMESTAMPDIFF(MINUTE,now(),g.end_date) > 0,1,0),g.status) status from group_bill g,bill b,user u where g.bill_id=b.id and b.user_id=u.id and g.id=${request.query.id}`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                const activity_name = _.find(util.activity(),(ac)=>{
                    return ac.code==res[0].activity_code;
                });
                res[0]['activity_name'] = activity_name?activity_name.name:"";
                const count = `select sum(d.bill_detail_num*b.price) sum from cart c,cart_detail d,bill_detail b where c.id=d.cart_id and d.bill_detail_id=b.id and c.group_bill_id=${request.query.id} and c.status=1 and c.is_confirm=1 `;
                request.app.db.query(count, (err, countres) => {
                    if(err) {
                        request.log(['error'], err);
                        reply(Boom.serverUnavailable(config.errorMessage));
                    } else {
                        res[0]['sum']=countres[0].sum;
                        reply(res);
                    }
                });
            }
        });
    },
    config: {
        description: '根据ID获得团购单信息',
        validate: {
            query: {
                id: Joi.number()
            }
        },
    }
};
