const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const fs = require("fs");
const cache = require("memory-cache");

module.exports = {
    path: '/api/users/get/pay',
    method: 'GET',
    handler(request, reply) {
        const decodeImg = cache.get("pay"+request.query.id);
        if(decodeImg){
            reply(decodeImg).type('image/png');
        }else{

            const select = `select pay_type from user where id=${request.query.id}`;
            request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                let defPayImg = new Buffer('iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAMAAAAOusbgAAACB1BMVEUAAACAgICAgICSkpKfn5+ZmZmioqKVlZWdnZ2ZmZmPj4+WlpacnJyUlJSZmZmSkpKXl5ebm5uVlZWZmZmTk5OXl5eVlZWZmZmUlJSXl5ebm5uZmZmVlZWYmJiWlpaZmZmVlZWYmJiUlJSYmJiXl5eZmZmWlpaYmJiVlZWZmZmWlpaYmJiWlpaYmJiXl5eYmJiWlpaYmJiWlpaXl5eYmJiYmJiWlpaXl5eYmJiXl5eYmJiWlpaXl5eYmJiWlpaXl5eYmJiWlpaXl5eWlpaXl5eYmJiWlpaXl5eXl5eYmJiXl5eYmJiXl5eYmJiWlpaXl5eWlpaWlpaXl5eYmJiWlpaXl5eWlpaXl5eYmJiXl5eXl5eYmJiWlpaWlpaXl5eWlpaXl5eXl5eWlpaYmJiXl5eXl5eWlpaYmJiXl5eWlpaYmJiXl5eXl5eWlpaYmJiXl5eXl5eXl5eWlpaXl5eWlpaYmJiXl5eXl5eYmJiXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eWlpaXl5eXl5eXl5eXl5eYmJiXl5eXl5eXl5eXl5eYmJiXl5eXl5eXl5eWlpaXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5f///9R6CP2AAAAq3RSTlMAAgQHCAoLDA0PEBESExQVFhcYGRobHR4fICEjJCUnKCkqKy8xMjM0NTc4OT0+QENESEtMTU9QUVJTVFVWWVxdXl9gYWJjZGVnaGlqbm9wc3V3eHl6e3x9fn+Ag4aLjI2OkJKUlZaXmZucnp+goaOlpqeoqa2vsbO0tbq7vL3AwsTFx8jJzM3Oz9DR0tPU1dbY2drb3N3f4OHi4+Tl5+jp6uzt9fb4+fr7/P5RvkxMAAAAAWJLR0SsV2XyiwAAApRJREFUaN7tm+lXElEYh19Bc48gLNuMksrKFhqiQC0ErGy1IjMqooVMQyqXyrKkrLDVIXDBkkrK0tsf2cyAhKV1DnBHD7zPh7mc3xzuA/fM3HuH9wCAiAj5D9R6RLGoYnGvKBSjGMUoTq2YzpS5sMU/Z5CYeO4+Fqb49xAlLp6rDxSjGMUopiPOtLk6/ddjBEEQBEk3skX2FQtHVeWSkZr4OEcq4cmiJx528McrbNaFKSP3Iq9qj06nM5Q8/RLi+GFNkWWFgdFE0VbJ+KScqPlm8ATAuQEpgLKji9xtu1MBq8u5+ENNisSG0OhwlNHQZj5p7YQCAA25abfbr1+yc8kOInwixxMA6dQWWgNdElZB/w3o8TPMNZbR7uaihnHhzC03QBmR0xI7W6F6cquePAeo74tED24LTc95biDCtLyV32uNY01LPwVfxMTFE30tLScBfIcAjryjJW5stvoeZfcGjnp97Mevb4dsAFZynHF7AMK7AC7ep3c3VY/JVc821Hmnv3HRZ7IJGj1QRLpdroDf5cqn41WNb+Obuv5p8bH3EXEOI1BPFFS864e8znsdAJaXB81tgybLdgBFRBxlLSWx9qxeJQFe3HS6K3jqDHc75Qri/cZ9PJadlMQRCmTmV7GrOpe47R6Pw3mVp1mfEnGhUrY4DvkyLpOoG7rb15lfx4ltps4UD/Xlvx79Kga+PazNAzC9iYkXTW4E6+PUimUrlYo4lq8Bqa1UOHNggmUDIywb1M18w6q9pJDqonzYP2usJqSd7m4gv3T2TYmmDHdmCIIgCIL8mz9/rE++OJBQTWJexckWgBIq/8yzOLkiX0IlPhSjGMUoTlKcaXN1pq3Hou13UIxiFKM4KTH+CSe9xYgo/ALR6HiJ3w9BywAAAABJRU5ErkJggg==', 'base64');
                if(res&&res[0]&&res[0].pay_type){
                    let flag = false;
                    let path = config["user"]+"pay/"+res[0].pay_type +"/";
                    let _type='png'
                    fs.readdir(path, function (err, files) {
                        if(files){
                            files.forEach(function (itm, index) {
                                const filedId = itm.split(".")[0];
                                if(filedId==request.query.id){
                                    path = path+itm;
                                    flag =true;
                                    _type = itm.split(".")[1];
                                    // reply({'status':'ok','imgPath':itm,'type':res[0].pay_type});
                                }
                            })
                        }
                        if(flag){
                            fs.readFile(path, function (err, data) {
                                const decodeImg = new Buffer(data.toString("base64"), 'base64');
                                cache.put("pay"+request.query.id, decodeImg);
                                reply(decodeImg).type('image/'+_type);
                            }); 
                        }else {
                            cache.put("pay"+request.query.id, defPayImg);
                            reply(defPayImg).type('image/png');
                        }
                    });
                }else{
                    cache.put("pay"+request.query.id, defPayImg);
                    reply(defPayImg).type('image/png');
                }
            }

        });

        }
    },
    config: {
        description: '根据ID获得支付二维码',
        validate: {
            query: {
                id: Joi.number().required(),
                r: Joi.optional()
            }
        }
    }
};
