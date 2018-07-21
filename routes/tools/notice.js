const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/notice/insert',
    method: 'GET',
    handler(request, reply) {
        const insert = `insert into focus (user_id,notice_id) VALUES(${request.query.user_id},${request.query.notice_id})`;
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
        description: '关注生物资料',
        validate: {
            query: {
                user_id: Joi.number().required(),
                notice_id: Joi.number().required()
            }
        },
    }
};
