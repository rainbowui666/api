
const fs = require("fs");
const config = require('../../config.js');
const Boom = require('boom');
const images = require("images");

module.exports = {
    method: 'POST',
    path: '/api/notice/publish',
    handler: (request, reply) => {
         const img = request.payload["img"];
         let dir = config["image"]+'notice/';
         fs.readdir(dir, function (err, files) {
                let max_id=1;
                files.forEach(function (itm, index) {
                    const filedId = itm.split(".")[0];
                    if (Number(filedId)>=max_id) {
                        max_id = Number(filedId);
                    }
                });
                const _name = img.hapi.filename;
                const tempName = _name.split(".");
                const path =  `${dir}${max_id+1}.${tempName[1]}`;
                const file = fs.createWriteStream(path);
                file.on('error', function (err) {
                    reply(Boom.notAcceptable('创建文件失败'));
                });

                img.pipe(file);

                img.on('end', function (err) {
                    const insert = `delete from focus where notice_id is not null`;
                    request.app.db.query(insert, (err, res) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else {
                            reply(config.ok);
                        } 
                    });
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
