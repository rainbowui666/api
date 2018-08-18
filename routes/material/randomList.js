const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/material/random/list',
    method: 'GET',
    handler(request, reply) {
        const select = `select m.*,(select id from focus where material_id=m.id and user_id=${request.query.user_id} ) focus_id from material m where classification=${request.query.classification} order by rand() LIMIT ${request.query.number}`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                reply(res);
            }
        });
    },
    config: {
        description: '随机获得生物资料信息',
        validate: {
            query: {
                number: Joi.number().required(),
                user_id: Joi.optional().default(0),
                classification: Joi.number().default(0),
            }
        },
    }
};
