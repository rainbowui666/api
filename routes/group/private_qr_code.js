const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const qr = require('qr-image');
const compile = (code) => {
    let c = String.fromCharCode(code.charCodeAt(0)+code.length);
    for(let i = 1; i < code.length; i++){
        c += String.fromCharCode(code.charCodeAt(i) + code.charCodeAt(i - 1));
    }
    c = escape(c.split('').join(' '));
    return c;
};
module.exports = {
    path: '/api/group/get/private/qr',
    method: 'GET',
    handler(request, reply) {
        const url = `http://www.coral123.com/?#/buy/${compile(request.query.id+'')}/page?private=${request.query.id}`;
        const qr_svg = qr.image(url, { type: 'png' });
        const path = config["user"]+"private/"+request.query.id+".png";
        qr_svg.pipe(require('fs').createWriteStream(path));

        // const svg_string = qr.imageSync(url, { type: 'svg' });
        reply({'status':'ok'});

    },
    config: {
        auth: 'jwt',
        description: '获得私有单地址二维码',
        validate: {
            query: {
                id: Joi.number().required(),
                user_id: Joi.number().required(),
            }
        },
        pre: [
            {
                method(request, reply) {
                    const user = request.auth.credentials;
                    if(user && user.id == request.query.user_id || user.type == 'yhgly') {
                        reply(true);
                    } else {
                        reply(Boom.notAcceptable('权限不足'));
                    }
                }
            }
        ]
    }
};
