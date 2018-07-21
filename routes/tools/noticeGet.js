const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const fs = require("fs");

module.exports = {
    path: '/api/notice/get',
    method: 'GET',
    handler(request, reply) {
            let dir = config["image"]+'notice/';
            fs.readdir(dir, function (err, files) {
                let max_id=1;
                let defaultItem='1.png';
                files.forEach(function (itm, index) {
                    const filedId = itm.split(".")[0];
                    if (Number(filedId)>=max_id) {
                        max_id = Number(filedId);
                        defaultItem = itm;
                    }
                });
                
                reply({'status':'ok','notice_file':'https://static.huanjiaohu.com/image/notice/'+defaultItem,'notice_id':max_id});
            });
    },
    config: {
        description: '关注生物资料'
    }
};
