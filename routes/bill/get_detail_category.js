const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const _ = require("lodash");

module.exports = {
    path: '/api/bill/detail/category',
    method: 'GET',
    handler(request, reply) {
        let where = request.query.name?`d.name LIKE '%${request.query.name}%'`:"1=1 ";
        const count_select = `select d.id, c.bill_detail_num number from bill b,bill_detail d,cart_detail c where c.bill_detail_id=d.id and  b.id=d.bill_id and ${where} and b.id=${request.query.id}`;
        request.app.db.query(count_select, (err, countRes) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                const select = `select d.* from bill b,bill_detail d,material m where b.id=d.bill_id and m.id = d.material_id  and ${where} and m.category='${request.query.category}' and d.material_id is not null and  b.id=${request.query.id} order by d.recommend desc`;
                request.app.db.query(select, (err, res) => {
                    if(err) {
                        request.log(['error'], err);
                        reply(Boom.serverUnavailable(config.errorMessage));
                    } else {
                        _.each(res, (re) => {
                            const id = re["id"];
                            let count = 0;
                            _.each(countRes, (countRe) => {
                                if (id == countRe["id"]) {
                                    count=count+Number(countRe["number"])
                                }
                            });
                            const numbers =  Number(re["numbers"]);
                            re["left_numbers"]= numbers-count;
                        });
                        reply(res);
                    }
                });
            }
        });
    },
    config: {
        description: '根据类型获得推荐团购清单的明细',
        validate: {
            query: {
                id: Joi.number().required(),
                name: Joi.string(),
                category:Joi.string().required(),
            }
        }
    }
};
