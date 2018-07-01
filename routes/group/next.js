const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const _ = require("lodash");
const xlsx =  require('node-xlsx');
const fs = require("fs");


module.exports = {
    path: '/api/group/next',
    method: 'POST',
    handler(request, reply) {
        const update = `update group_bill set current_step=current_step+1 where id=${request.payload.id}`;
        request.app.db.query(update, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                reply({"status":"ok"});
            }
        });
    },
    config: {
        auth: 'jwt',
        description: '根据ID设置团购下一步',
        validate: {
            payload: {
                user_id: Joi.number().required(),
                id: Joi.number().required()
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
                        } else if(res && res[0].user_id == request.payload.user_id || 0 == request.payload.user_id) {
                            reply(true);
                        } else if(res && user.type == 'tggly') {
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
                    const user = request.auth.credentials;
                    request.app.db.query(select, (err, res) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else if(res && res[0].status == 0) {
                            reply(true);
                        } else {
                            reply(Boom.notAcceptable('您的团购还没有结束'));
                        }
                    });
                }
            },
            {
                method(request, reply) {
                    const select = `select count(is_pay) count from cart where status=1 and is_pay=0 and sum<>0 and group_bill_id=${request.payload.id}`;
                    request.app.db.query(select, (err, res) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else if(res && res[0].count == 0) {
                            reply(true);
                        } else {
                            reply(Boom.notAcceptable('鱼友尚未全部支付'));
                        }
                    });
                }
            }
        ]
    }
};

