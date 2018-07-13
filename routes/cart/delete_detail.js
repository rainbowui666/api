const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const util = require('../../lib/util.js');

module.exports = {
    path: '/api/cart/delete/detail',
    method: 'POST',
    handler(request, reply) {
        const update = `delete from cart_detail where  cart_id=${request.payload.cart_id} and  bill_detail_id=${request.payload.bill_detail_id}`;
        request.app.db.query(update, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                reply(config.ok);
            }
        });
    },
    config: {
        auth: 'jwt',
        description: '根据购物车id删减购物车明细',
        validate: {
            payload: {
                cart_id: Joi.number().required(),
                bill_detail_id: Joi.number().required(),
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
            },
            {
                method(request, reply) {
                    const select = `select group_bill_id count from cart where id=${request.payload.cart_id}`;
                    request.app.db.query(select, (err, res) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else{
                            const select1 = `select status count from group_bill where id=${res[0].group_bill_id}`;
                            request.app.db.query(select1, (err, res1) => {
                                if(err) {
                                    request.log(['error'], err);
                                    reply(Boom.serverUnavailable(config.errorMessage));
                                } else if( res1 && Number(res1[0].status) == 0) {
                                    reply(Boom.notAcceptable('团购已经结束不能操作购物车'));
                                } else {
                                    reply(true);
                                }
                            });
                        } 
                    });
                    
                }
            }
        ]
    }
};
