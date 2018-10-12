const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const _ = require('lodash');

module.exports = {
    path: '/api/tools/share/select',
    method: 'POST',
    handler(request, reply) {
        const select = `select * from share where user_id=${request.payload.user_id} and param='${request.payload.param}' and DATE_FORMAT(insert_date,'%Y%m%d') = '${request.payload.date}'`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                _.each(res, (re) => {
                    const deleteSql = `delete from share where id=${re.id}`;
                    request.app.db.query(deleteSql, (err, res) => {
                        if(err) {
                            reply(Boom.serverUnavailable(config.errorMessage));
                        }
                    });
                });
                reply(res);
            }
        });
    },
    config: {
        description: '关注生物资料',
        validate: {
            payload: {
                user_id: Joi.number().required(),
                param: Joi.string().required(),
                date: Joi.string().required()
            }
        }
    }
};
