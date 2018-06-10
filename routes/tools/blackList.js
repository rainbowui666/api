const Boom = require('boom');
const Joi = require('joi');
const cache = require("memory-cache");

module.exports = {
    path: '/api/tools/black',
    method: 'GET',
    handler(request, reply) {
        const black = cache.get("black"+request.query.type);
        if(black){
            reply(black);
        }else{
            const select = `select * from black_list where type='${request.query.type}'`;
            request.app.db.query(select, (err, res) => {
                if(err) {
                    request.log(['error'], err);
                    reply(Boom.serverUnavailable(config.errorMessage));
                } else {
                    reply(res);
                    cache.put("black"+request.query.type, res);
                }
            });
        }
        
    },
    config: {
        description: '根据类型获得黑名单',
        validate: {
            query: {
                type: Joi.number().required(),
            }
        },
    }
};