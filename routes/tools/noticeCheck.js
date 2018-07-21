const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/notice/check',
    method: 'GET',
    handler(request, reply) {
        const select = `select count(1) count from focus where user_id=${request.query.user_id} and notice_id=${request.query.notice_id}`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else if(res && res[0].count ==1) {
                reply({"status":'ok',"checked":false});
            }else{
                reply({"status":'ok',"checked":true});
            }
        });
    },
    config: {
        description: '关注生物资料',
        validate: {
            query: {
                user_id: Joi.number().required(),
                notice_id: Joi.number().required()
            }
        },
    }
};
