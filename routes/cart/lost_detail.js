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
                                const select3 = `select g.freight,g.top_freight from cart c,group_bill g where c.group_bill_id=g.id and c.id=${request.payload.cart_id}`;
                                request.app.db.query(select3, (err, res3) => {
                                    if(err) {
                                        request.log(['error'], err);
                                        reply(Boom.serverUnavailable(config.errorMessage));
                                    } else {
                                        const temp_freight = res2[0].sum*res3[0].freight;
                                        let back_freight = null;
                                        if(Number(res3[0].top_freight)==0){
                                            back_freight = temp_freight;
                                        }else{
                                            back_freight = temp_freight>res3[0].top_freight?res3[0].top_freight:temp_freight;
                                        }
                                        let update2 = `update cart set lost_back=lost_back-${res2[0].sum+back_freight},freight=freight-${back_freight}  where id=${request.payload.cart_id}`;
                                        if(lost_num>0){
                                            update2 =  `update cart set lost_back=lost_back+${res2[0].sum+back_freight},freight=freight+${back_freight}  where id=${request.payload.cart_id}`;
                                        }
                                        request.app.db.query(update2, (err, res) => {
                                            if(err) {
                                                request.log(['error'], err);
                                                reply(Boom.serverUnavailable(config.errorMessage));
                                            } else {
                                                let update3 = `update cart_detail set lost_back_freight=lost_back_freight-${back_freight} where cart_id=${request.payload.cart_id} and  bill_detail_id=${request.payload.bill_detail_id} `;
                                                if(lost_num>0){
                                                    update3 =  `update cart_detail set lost_back_freight=lost_back_freight+${back_freight} where cart_id=${request.payload.cart_id} and  bill_detail_id=${request.payload.bill_detail_id}`;
                                                }

                                                request.app.db.query(update3, (err, res) => {
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
