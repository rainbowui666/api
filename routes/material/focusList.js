const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const _ = require('lodash');
module.exports = {
    path: '/api/material/focus/list',
    method: 'GET',
    handler(request, reply) {
                const select = `select m.* from material m,focus f where m.id=f.material_id and f.user_id=${request.query.user_id}  order by f.insert_date desc`;
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
        description: '获得用户关注所有生物资料信息',
        validate: {
            query: {
                user_id: Joi.required()
            }
        },
    }
};
