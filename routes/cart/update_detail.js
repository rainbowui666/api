const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const util = require('../../lib/util.js');
module.exports = {
    path: '/api/cart/update/detail',
    method: 'POST',
    handler(request, reply) {
        const insert = `select sum(bill_detail_num) count ,b.numbers,b.name,ca.user_id  from cart_detail c ,bill_detail b,cart ca  where ca.id=c.cart_id and  c.bill_detail_id = b.id and c.cart_id!=${request.payload.cart_id} and c.bill_detail_id=${request.payload.bill_detail_id} and ca.group_bill_id=${request.payload.group_bill_id}`;
        request.app.db.query(insert, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                if ((Number(res[0]["count"])+ request.payload.bill_detail_num) > Number(res[0]["numbers"])) {
                    reply({"status":res[0]['name'] + '  库存不足'});
                }else{
                    const select2 = `select org_bill_detail_num,lost_num,damage_num from cart_detail where cart_id=${request.payload.cart_id} and  bill_detail_id=${request.payload.bill_detail_id} `;
                    request.app.db.query(select2, (err, res2) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else {

                            let org_bill_detail_num = request.payload.org_bill_detail_num?request.payload.org_bill_detail_num:res2[0]?res2[0].org_bill_detail_num:1;
                            let lost_num = res2[0]?res2[0].lost_num:0;
                            let damage_num = res2[0]?res2[0].damage_num:0;

                            
                            const select = `delete from cart_detail where cart_id=${request.payload.cart_id} and  bill_detail_id=${request.payload.bill_detail_id} `;
                            request.app.db.query(select, (err, res) => {
                                if(err) {
                                    request.log(['error'], err);
                                    reply(Boom.serverUnavailable(config.errorMessage));
                                } else {
                                    const insert = `insert into cart_detail (cart_id,bill_detail_id,bill_detail_num,org_bill_detail_num,lost_num,damage_num) values (${request.payload.cart_id},${request.payload.bill_detail_id},${request.payload.bill_detail_num},${org_bill_detail_num},${lost_num},${damage_num})`;
                                    request.app.db.query(insert, (err, res) => {
                                        if(err) {
                                            request.log(['error'], err);
                                            reply(Boom.serverUnavailable(config.errorMessage));
                                        } else {
                                            reply(config.ok);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        });
    },
    config: {
        auth: 'jwt',
        description: '根据购物车id更新购物车明细',
        validate: {
            payload: {
                cart_id: Joi.number().required(),
                bill_detail_id: Joi.number().required(),
                bill_detail_num: Joi.number().required(),
                group_bill_id: Joi.number().required(),
                org_bill_detail_num:Joi.optional()
            }
        },
        pre: [
            {
                method(request, reply) {
                    const select = `select count(1) count from cart where id=${request.payload.cart_id}`;
                    request.app.db.query(select, (err, res) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else if(res && res[0].count === 0) {
                            reply(Boom.notAcceptable('请先创建购物车'));
                        } else {
                            reply(true);
                        }
                    });
                }
            }
        ]
    }
};