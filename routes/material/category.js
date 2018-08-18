const Boom = require('boom');

module.exports = {
    path: '/api/material/category',
    method: 'GET',
    handler(request, reply) {
        const category = [
            {"code":"hy","name":"海鱼","desc":""},
            {"code":"rt","name":"软体","desc":""},
            {"code":"yg","name":"硬骨","desc":""},
            {"code":"qt","name":"其他生物","desc":""},
            {"code":"hc","name":"耗材","desc":""},
            {"code":"sb","name":"设备","desc":""},

        ]
        reply(category);
    },
    config: {
        description: '获得生物种类'
    }
};
