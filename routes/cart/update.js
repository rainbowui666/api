const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const util = require('../../lib/util.js');
const _ = require("lodash");

module.exports = {
    path: '/api/cart/update',
    method: 'POST',
    handler(request, reply) {
        const select  = `select * from cart where id=${request.payload.id}`;
        request.app.db.query(select, (err, cart) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {

                if(cart[0].is_pay==1){
                    cart[0].is_pay=2;
                }

                let update = `update cart set is_pay=${cart[0].is_pay},  sum=${request.payload.sum}, phone='${request.payload.phone?request.payload.phone:cart[0].phone}', description='${request.payload.description?request.payload.description:cart[0].description}', status='${request.payload.status}' , freight='${request.payload.freight?request.payload.freight:cart[0].freight}'  where id=${request.payload.id}`;
                request.app.db.query(update, (err, res) => {
                    if(err) {
                        request.log(['error'], err);
                        reply(Boom.serverUnavailable(config.errorMessage));
                    } else {
                        reply({'status':'ok','id':res.insertId});
                    }
                });

            }
        });
      
    },
    config: {
        auth: 'jwt',
        description: '更新购物车',
        validate: {
            payload: {
                id: Joi.number().required(),
                status: Joi.number().required(),
                sum: Joi.number().required(),
                freight: Joi.number().required(),
                phone: Joi.number().required(),
                description: Joi.optional()
            }
        }
    }
};
