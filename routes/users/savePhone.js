const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/users/save/phone',
    method: 'POST',
    handler(request, reply) {

        const insert = `update user set phone='${request.payload.phone}' where id=${request.payload.id}`;
        request.app.db.query(insert, (err, res) => {
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
        description: '根据ID更新用户',
        validate: {
            payload: {
                phone: Joi.string().required().max(11),
                id: Joi.number().required()
            }
        },
        pre: [
            {
                method(request, reply) {
                    const user = request.auth.credentials;
                    if(user && user.id == request.payload.id || user.type == 'yhgly') {
                        reply(true);
                    } else {
                        reply(Boom.notAcceptable('权限不足'));
                    }
                }
            }
        ]
    }
};
