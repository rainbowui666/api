const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const util = require('../../lib/util.js');

module.exports = {
    path: '/api/cart/add',
    method: 'POST',
    handler(request, reply) {
        const userSelect  = `select phone from user where id=${request.payload.user_id}`;
        request.app.db.query(userSelect, (err, userRes) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {

                const select = `insert into cart (group_bill_id,user_id,phone,status) values (${request.payload.group_bill_id},${request.payload.user_id},'${userRes[0].phone}',${request.payload.status})`;
                request.app.db.query(select, (err, res) => {
                    if(err) {
                        request.log(['error'], err);
                        reply(Boom.serverUnavailable(config.errorMessage));
                    } else {
                        reply({'status':'ok','id':res.insertId});
                    }
                });
                
            }
        });
      
    },
    config: {
        auth: 'jwt',
        description: '创建购物车',
        validate: {
            payload: {
                group_bill_id: Joi.number().required(),
                user_id: Joi.number().required(),
                status: Joi.number().required()
            }
        },
        pre: [
            {
                method(request, reply) {
                    const select = `select count(1) count from cart where user_id=${request.payload.user_id} and group_bill_id=${request.payload.group_bill_id}`;
                    request.app.db.query(select, (err, res) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else if(res && res[0].count === 0) {
                            reply(true);
                        } else {
                            reply(Boom.notAcceptable('购物车已经存在'));
                        }
                    });
                }
            }
        ]
    }
};
