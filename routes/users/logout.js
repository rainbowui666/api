const Joi = require('joi');
const Boom = require('boom');
const JWT = require('jsonwebtoken');
const config = require('../../config.js');
const _  = require('lodash');
module.exports = {
    path: '/api/users/logout',
    method: 'POST',
    handler(request, reply) {
        const select = `select id from user where id=${request.payload.id}`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
               if(_.isEmpty(res[0])){
                    reply(Boom.notAcceptable('该用户不存在'));
               }else{
                    reply(config.ok);
               }
            }
        });
    },
    config: {
        description: '登出',
        validate: {
            payload: {
                id: Joi.number().required()
            }
        }
    }
};
