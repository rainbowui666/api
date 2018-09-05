const Boom = require('boom');
const Joi = require('joi');
const _ = require("lodash");

module.exports = {
    path: '/api/game/list',
    method: 'GET',
    handler(request, reply) {
        const select = `select level,title,time,u.name,u.headimgurl from game g,user u where g.user_id=u.id  order by level desc,time asc limit 50`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                reply(res.concat(res).concat(res).concat(res).concat(res))
            }
        });
        
    },
    config: {
        description: '游戏排行'
    }
};