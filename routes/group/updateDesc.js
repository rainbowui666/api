const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/group/update/description',
    method: 'POST',
    handler(request, reply) {
        const update = `update group_bill set  description='${request.payload.description}' where id=${request.payload.id}`;
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
        description: '根据ID更新团购清单',
        validate: {
            payload: {
                description: Joi.string().required().default(" "),
                id: Joi.number().required(),
                user_id: Joi.number().required()
            }
        },
        pre: [
            {
                method(request, reply) {
                    const select = `select user_id from group_bill where id=${request.payload.id}`;
                    const user = request.auth.credentials;
                    
                    request.app.db.query(select, (err, res) => {

                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else if(res && res[0].user_id == request.payload.user_id || user.type == 'tggly') {
                            reply(true);
                        } else {
                            reply(Boom.notAcceptable('您没有权限更新这个单子'));
                        }
                    });
                }
            },
            {
                method(request, reply) {
                    const select = `select status from group_bill where id=${request.payload.id}`;
                    request.app.db.query(select, (err, res) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else if(res && res[0].status == 0) {
                            reply(Boom.notAcceptable('已经结束的团购单不能更新'));
                        } else {
                            reply(true);
                        }
                    });
                }
            },
           
        ]
    }
};

