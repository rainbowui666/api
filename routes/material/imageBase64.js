const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const fs = require("fs");
const cache = require("memory-cache");
const defaultImg = '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';
module.exports = {
    path: '/api/material/image/base64/small',
    method: 'GET',
    handler(request, reply) {
        const decodeImg = cache.get(request.query.id);
        if(decodeImg){
            reply(decodeImg).type('image/png');
        }else{
            const select = `select category,code  from material where id=${request.query.id}`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                if(res&&res[0]&&res[0].category){
                    const filePath = config.material + "/"+res[0].category+"/";
                    const results = [];
                    fs.readdir(filePath,function(err,files){
                        if(err){
                            console.log(err);
                            return;
                        }
                        let small_path =null;
                        files.forEach(function(filename){
                            const temp = filename.substring(0,filename.indexOf(".")).split("-");
                            if(res[0].code == temp[1]){
                                small_path = config.material + "/small"+`/${res[0].category}/${filename}`;
                            }
                        });
                        if(small_path){
                            try {
                                fs.readFile(small_path, function (err, data) {
                                    if (err) {
                                        reply(new Buffer(defaultImg, 'base64')).type('image/png');
                                    }else if(data){
                                            const decodeImg = new Buffer(data.toString("base64"), 'base64');
                                            cache.put(request.query.id, decodeImg);
                                            reply(decodeImg).type('image/png');
                                        }else{
                                            reply(new Buffer(defaultImg, 'base64')).type('image/png');
                                    }
                                 });
                            } catch (error) {
                                reply(new Buffer(defaultImg, 'base64')).type('image/png');
                            }
                        }else{
                                reply(new Buffer(defaultImg, 'base64')).type('image/png');
                        }
                    });
                }else{
                    reply(new Buffer(defaultImg, 'base64')).type('image/png');
                }
            }
        });
        }
        
    },
    config: {
        description: '根据ID获得生物资料图片',
        validate: {
            query: {
                id: Joi.number().required()
            }
        }
    }
};
