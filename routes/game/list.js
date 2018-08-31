const Boom = require('boom');
const Joi = require('joi');
const _ = require("lodash");

module.exports = {
    path: '/api/game/list',
    method: 'GET',
    handler(request, reply) {
        const select = `select level,title,time,(select name from user where id=user_id) name from game order by level desc,time asc limit 10`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                reply(res)
            }
        });
        
    },
    config: {
        description: '游戏排行',
        validate: {
            query: {
                type: Joi.number().required(),
            }
        },
    }
};