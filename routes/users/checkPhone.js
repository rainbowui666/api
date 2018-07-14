const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const _ = require('lodash');

module.exports = {
    path: '/api/users/checkPhone',
    method: 'GET',
    handler(request, reply) {
     
        const select = `select phone from user where id=${request.query.id}`;
        request.app.db.query(select, (err, select_res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                if('18888888888'==select_res[0].phone){
                    reply({'status':'ok','isBindPhone':false});
                }else{
                    reply({'status':'ok','isBindPhone':true});
                }
            }
        });
    },
    config: {
        description: '检查姓名是否重复',
        validate: {
            query: {
                id: Joi.number().required()
            }
        },
    }
};
