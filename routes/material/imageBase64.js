const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const fs = require("fs");
// const image2base64 = require('image-to-base64');

module.exports = {
    path: '/api/material/image/base64/small',
    method: 'GET',
    handler(request, reply) {
        const select = `select category,code  from material where id=${request.query.id}`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                if(res&&res[0]&&res[0].category){
                    const filePath = config.image + "/"+res[0].category+"/";
                    const results = [];
                    fs.readdir(filePath,function(err,files){
                        if(err){
                            console.log(err);
                            return;
                        }
                        files.forEach(function(filename){
                            const temp = filename.substring(0,filename.indexOf(".")).split("-");
                            if(res[0].code == temp[1]){
                                const small_path = config["image"] + "/small"+`/${res[0].category}/${filename}`;
                                // image2base64(small_path).then(
                                //     (response) => {
                                //         console.log(response); //cGF0aC90by9maWxlLmpwZw==
                                //         reply(response);
                                //     }
                                // )
                                // .catch(
                                //     (error) => {
                                //         console.log(error); //Exepection error....
                                //     }
                                // )
                                // const imageBuf = fs.readFileSync(small_path);
                                // const base = imageBuf.toString('base64');
                                // console.log(base);
                            }
                        });
                    });
                }else{
                    reply({'status':'ok'});
                }
            }
        });
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
