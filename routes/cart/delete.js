const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const fs = require("fs");

module.exports = {
    path: '/api/cart/delete',
    method: 'GET',
    handler(request, reply) {
        const update = `delete from cart_detail  where cart_id=${request.query.id}`;
        request.app.db.query(update, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                const update = `delete from cart  where id=${request.query.id}`;
                request.app.db.query(update, (err, res) => {
                    if(err) {
                        request.log(['error'], err);
                        reply(Boom.serverUnavailable(config.errorMessage));
                    } else {
                        reply(config.ok);
                    }
                });
            }
        });
    },
    config: {
        auth: 'jwt',
        description: '根据ID删除购物车',
        validate: {
            query: {
                id: Joi.number().required()
            }
        },
        pre: [
            {
                method(request, reply) {
                    const user = request.auth.credentials;
                    const select = `select group_bill_id from cart where id=${request.query.id}`;
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
                                } else if( res1 && Number(res1[0].status) == 0) {
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
