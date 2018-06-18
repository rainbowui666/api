const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const util = require('../../lib/util.js');
const _ = require("lodash");

module.exports = {
    path: '/api/cart/update',
    method: 'POST',
    handler(request, reply) {
        let update = null;
        if(_.isEmpty(request.payload.phone)){
            update = `update cart set sum=${request.payload.sum}, description='${request.payload.description}', status='${request.payload.status}' , freight='${request.payload.freight}'  where id=${request.payload.id}`;
        }else{
            update = `update cart set sum=${request.payload.sum}, phone='${request.payload.phone}', description='${request.payload.description}', status='${request.payload.status}' , freight='${request.payload.freight}'  where id=${request.payload.id}`;
        }
        request.app.db.query(update, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                reply({'status':'ok','id':res.insertId});
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
                freight: Joi.optional().default(0.00),
                phone: Joi.optional(),
                description: Joi.optional().default("")
            }
        }
    }
};
