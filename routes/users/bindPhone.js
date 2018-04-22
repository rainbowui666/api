const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/users/bind/phone',
    method: 'POST',
    handler(request, reply) {

        const select = `select province from user where id=${request.payload.id}`;
        request.app.db.query(select, (err, select_res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                if(request.payload.province == select_res[0].province){
                    const insert = `update user set phone='${request.payload.phone}' where id=${request.payload.id}`;
                    request.app.db.query(insert, (err, res) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else {
                            reply(config.ok);
                        }
                    });
                }else{
                    const insert = `update user set city='', province='${request.payload.province}', phone='${request.payload.phone}' where id=${request.payload.id}`;
                    request.app.db.query(insert, (err, res) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else {
                            reply(config.ok);
                        }
                    });
                }
            }
        });

      
    },
    config: {
        auth: 'jwt',
        description: '根据ID更新用户',
        validate: {
            payload: {
                province: Joi.string().required(),
                phone: Joi.string().required().max(11),
                id: Joi.number().required()
            }
        }
    }
};
