const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/tools/share/add',
    method: 'POST',
    handler(request, reply) {
        const insert = `insert into share (user_id,param,encryptedData,iv) VALUES(${request.payload.user_id},'${request.payload.param}','${request.payload.encryptedData}','${request.payload.iv}')`;
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
        description: '关注生物资料',
        validate: {
            payload: {
                user_id: Joi.number().required(),
                param: Joi.string().required(),
                encryptedData: Joi.string().required(),
                iv: Joi.string().required(),
            }
        },
    }
};
