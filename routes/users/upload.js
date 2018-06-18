
const fs = require("fs");
const config = require('../../config.js');
const Boom = require('boom');
const cache = require("memory-cache");
const images = require("images");

module.exports = {
    method: 'POST',
    path: '/api/users/upload',
    handler: (request, reply) => {
        
         const upload = request.payload;
         const id = upload.id;
         const img = upload["img"];
         fs.readdir(config["user"], function (err, files) {
             if(files){
                files.forEach(function (itm, index) {
                    const filedId = itm.split(".")[0];

                    if(filedId==id){
                       fs.unlinkSync(config["user"] + itm);
                    }
                })
             }
            const _name = img.hapi.filename;
            const tempName = _name.split(".");
            let timestamp = Date.parse(new Date());
            timestamp = timestamp / 1000;
            const name = id+"."+tempName[1];
            const path = config["user"] + name;
            const temp_path = config["user"]+"temp/" + name;

            const file = fs.createWriteStream(temp_path);
            file.on('error', function (err) {
                reply(Boom.notAcceptable('创建文件失败'));
            });
            img.pipe(file);
            img.on('end', function (err) {
               const returnPath = `${name}`;
               cache.del("user"+id);
               images(temp_path).size(150).save(path, {               
                       quality : 75                    
               });
               reply({'status':'ok','imgPath':returnPath});
            })
         });

    },
    config: {
        auth: 'jwt',
        payload: {
            output: 'stream',
            parse: true,
            allow: 'multipart/form-data'
        },
        description: '添加生物资料图片'
    }
};
