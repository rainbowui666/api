const Boom = require('boom');
const util = require('../../lib/util.js');

module.exports = {
    path: '/api/group/activity',
    method: 'GET',
    handler(request, reply) {
        reply(util.activity());
    },
    config: {
        description: '获得活动类型'
    }
};
