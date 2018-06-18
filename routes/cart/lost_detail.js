const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const util = require('../../lib/util.js');

module.exports = {
    path: '/api/cart/detail/lost',
    method: 'POST',
    handler(request, reply) {
        const update = `select bill_detail_num from cart_detail  where cart_id=${request.payload.cart_id} and  bill_detail_id=${request.payload.bill_detail_id} `;
        request.app.db.query(update, (err, lostres) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                const lost_num =  lostres[0].bill_detail_num -request.payload.lost_num;  
                let update = `update cart_detail set lost_num=lost_num-1 where cart_id=${request.payload.cart_id} and  bill_detail_id=${request.payload.bill_detail_id} `;
                if(lost_num>0){
                    update =  `update cart_detail set lost_num=lost_num+1 where cart_id=${request.payload.cart_id} and  bill_detail_id=${request.payload.bill_detail_id} `;
                }
                request.app.db.query(update, (err, res) => {
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
                                const select3 = `select g.freight from cart c,group_bill g where c.group_bill_id=g.id and c.id=${request.payload.cart_id}`;
                                request.app.db.query(select3, (err, res3) => {
                                    if(err) {
                                        request.log(['error'], err);
                                        reply(Boom.serverUnavailable(config.errorMessage));
                                    } else {
                                        let update2 = `update cart set lost_back=lost_back-${(res2[0].sum*(1+res3[0].freight))}  where id=${request.payload.cart_id}`;
                                        if(lost_num>0){
                                            update2 =  `update cart set lost_back=lost_back+${(res2[0].sum*(1+res3[0].freight))}  where id=${request.payload.cart_id}`;
                                        }
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
             }
        });
    },
    config: {
        auth: 'jwt',
        description: '购物车缺货',
        validate: {
            payload: {
                cart_id: Joi.number().required(),
                bill_detail_id: Joi.number().required(),
                lost_num: Joi.number().required()
            }
        }
    }
};
