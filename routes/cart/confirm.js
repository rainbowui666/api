const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const util = require('../../lib/util.js');

module.exports = {
    path: '/api/cart/comfirm/update',
    method: 'POST',
    handler(request, reply) {
        const update = `update cart set is_comfirm=${request.payload.status} where id=${request.payload.id}`;
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
                status: Joi.number().required(),
            }
        }
    }
};
