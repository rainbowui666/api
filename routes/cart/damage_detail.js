const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const util = require('../../lib/util.js');

module.exports = {
    path: '/api/cart/detail/damage',
    method: 'POST',
    handler(request, reply) {
        const update = `update cart_detail set is_damage=1 where cart_id=${request.payload.cart_id} and  bill_detail_id=${request.payload.bill_detail_id} `;
        request.app.db.query(update, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                const select = `select damage_back  from cart where id=${request.payload.cart_id}`;
                request.app.db.query(select, (err, res) => {
                    if(err) {
                        request.log(['error'], err);
                        reply(Boom.serverUnavailable(config.errorMessage));
                    } else {
                        const select2 = `select b.price sum from bill_detail b where id=${request.payload.bill_detail_id}`;
                        request.app.db.query(select2, (err, res2) => {
                            if(err) {
                                request.log(['error'], err);
                                reply(Boom.serverUnavailable(config.errorMessage));
                            } else {
                                const update2 = `update cart set damage_back=${res[0].damage_back+res2[0].sum} where id=${request.payload.cart_id}`;
                                request.app.db.query(update2, (err, res) => {
                                            if(err) {
                                                request.log(['error'], err);
                                                reply(Boom.serverUnavailable(config.errorMessage));
                                            } else {
                                                reply({'status':'ok'});
                                            }
                                });
                            }
                        });
                    }
                });
            }
        });
    },
    config: {
        auth: 'jwt',
        description: '购物车报损',
        validate: {
            payload: {
                cart_id: Joi.number().required(),
                bill_detail_id: Joi.number().required(),
            }
        }
    }
};
