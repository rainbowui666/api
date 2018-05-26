const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/material/focus',
    method: 'GET',
    handler(request, reply) {
        const select = `select count(1) count from focus where user_id=${request.query.user_id} and material_id=${request.query.material_id}`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else if(res && res[0].count ==0) {
                const insert = `insert into focus (user_id,material_id) VALUES(${request.query.user_id},${request.query.material_id})`;
                request.app.db.query(insert, (err, res) => {
                    if(err) {
                        request.log(['error'], err);
                        reply(Boom.serverUnavailable(config.errorMessage));
                    } else {
                        reply(config.ok);
                    } 
                });
            } else {
                const del = `delete from focus where user_id=${request.query.user_id} and material_id=${request.query.material_id}`;
                request.app.db.query(del, (err, res) => {
                    if(err) {
                        request.log(['error'], err);
                        reply(Boom.serverUnavailable(config.errorMessage));
                    } else {
                        reply(config.ok);
                    } 
                });
            }
        });
    },
    config: {
        auth: 'jwt',
        description: '关注生物资料',
        validate: {
            query: {
                user_id: Joi.number().required(),
                material_id: Joi.number().required()
            }
        },
    }
};
