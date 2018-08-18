const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const util = require('../../lib/util.js');
const _ = require("lodash");

module.exports = {
    path: '/api/cart/update',
    method: 'POST',
    handler(request, reply) {
        const select  = `select * from cart where id=${request.payload.id}`;
        request.app.db.query(select, (err, cart) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {

                let userSelect = `select phone from user where id=${cart[0].user_id}`;
                request.app.db.query(userSelect, (err, userRes) => {
                    if(err) {
                        request.log(['error'], err);
                        reply(Boom.serverUnavailable(config.errorMessage));
                    } else {
                        if(cart[0].is_pay==1){
                            cart[0].is_pay=2;
                        }
                        let phone = userRes[0].phone;
                        const requestPhone = _.trim(request.payload.phone);
                        if(!_.isEmpty(requestPhone)){
                            phone = requestPhone;
                        }
        
                        let update = `update cart set is_pay=${cart[0].is_pay}, sum=${request.payload.sum}, phone='${phone}', description='${request.payload.description?request.payload.description:cart[0].description}', status='${request.payload.status}' , freight='${request.payload.freight?request.payload.freight:cart[0].freight}'  where id=${request.payload.id}`;
                        request.app.db.query(update, (err, res) => {
                            if(err) {
                                request.log(['error'], err);
                                reply(Boom.serverUnavailable(config.errorMessage));
                            } else {
                                if(!_.isEmpty(request.payload.address)){
                                    let user_update = `update user set contacts='${request.payload.contacts}',address='${request.payload.address}',province='${request.payload.province}',city='${request.payload.city}' where id=${cart[0].user_id}`;
                                    request.app.db.query(user_update, (err, user_res) => {
                                        if(err) {
                                            request.log(['error'], err);
                                            reply(Boom.serverUnavailable(config.errorMessage));
                                        } else {
                                            reply({'status':'ok','id':res.insertId});
                                        }
                                    });
                                }else{
                                    reply({'status':'ok','id':res.insertId});
                                }
                            }
                        });
                    }
                });

            }
        });
      
    },
    config: {
        auth: 'jwt',
        description: '更新购物车',
        validate: {
            payload: {
                id: Joi.number().required(),
                status: Joi.number().required(),
                sum: Joi.number().required(),
                freight: Joi.number().required(),
                phone: Joi.optional(),
                address: Joi.optional(),
                province: Joi.optional(),
                city: Joi.optional(),
                contacts: Joi.optional(),
                description: Joi.optional().default(""),
            }
        },
        pre: [
            {
                method(request, reply) {
                    const select = `select count(1) count from cart where id=${request.payload.id}`;
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
                    const user = request.auth.credentials;
                    const select = `select group_bill_id from cart where id=${request.payload.id}`;
                    request.app.db.query(select, (err, res) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else{
                            const select1 = `select status,user_id from group_bill where id=${res[0].group_bill_id}`;
                            request.app.db.query(select1, (err, res1) => {
                                if(err) {
                                    request.log(['error'], err);
                                    reply(Boom.serverUnavailable(config.errorMessage));
                                }  else if( res1 &&  Number(res1[0].status) == 0) {
                                    if(user.id==res1[0].user_id){
                                        reply(true);
                                    }else{
                                        reply(Boom.notAcceptable('团购已经结束不能操作购物车'));
                                    }
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
