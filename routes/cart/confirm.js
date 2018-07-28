const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const util = require('../../lib/util.js');

module.exports = {
    path: '/api/cart/confirm/update',
    method: 'POST',
    handler(request, reply) {
        const update = `update cart set is_confirm=${request.payload.is_confirm} where id=${request.payload.id}`;
        request.app.db.query(update, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                reply({'status':'ok'});
            }
        });
    },
    config: {
        auth: 'jwt',
        description: '已支付购物车',
        validate: {
            payload: {
                id: Joi.number().required(),
                is_confirm: Joi.number().required(),
            }
        }
    }
};
