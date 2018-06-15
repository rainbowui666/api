const Boom = require('boom');

module.exports = {
    path: '/api/users/qq',
    method: 'GET',
    handler(request, reply) {
        const qq = [
            {"qq":"123456789","name":"鱼友交流群","desc":"可以参加团购",'province':'sh'},
            {"qq":"123456789","name":"鱼友交流群","desc":"可以参加团购",'province':'sh'},
            {"qq":"123456789","name":"鱼友交流群","desc":"可以参加团购",'province':'sh'},
        ]
        reply(qq);
    },
    config: {
        description: '获得用户类型'
    }
};
