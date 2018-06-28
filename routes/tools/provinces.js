const Boom = require('boom');
const cache = require("memory-cache");
const util = require('../../lib/util.js');

module.exports = {
    path: '/api/tools/provinces',
    method: 'GET',
    handler(request, reply) {
        reply(util.provinces());
    },
    config: {
        description: '获得所有省份列表'
    }
};