const Boom = require('boom');
const Joi = require('joi');

module.exports = {
    path: '/api/tools/city/code',
    method: 'GET',
    handler(request, reply) {
        const select = `select * from citys where mark='${request.query.code}'`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                reply(res[0]);
            }
        });
    },
    config: {
        description: '获得城市信息',
        validate: {
            query: {
                code: Joi.string().required(),
            }
        },
    }
};