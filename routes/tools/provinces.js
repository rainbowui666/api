const Boom = require('boom');

module.exports = {
    path: '/api/tools/provinces',
    method: 'GET',
    handler(request, reply) {
        const citys = [
            {"code":"sh","name":"上海",'qq':''},
            {"code":"bj","name":"北京",'qq':''},
            {"code":"hn","name":"河南",'qq':''},
            {"code":"js","name":"江苏",'qq':''},
            {"code":"zj","name":"浙江",'qq':''},
            {"code":"tj","name":"天津",'qq':''},
            {"code":"gd","name":"广东",'qq':''},
            {"code":"sd","name":"山东",'qq':''},
            {"code":"he","name":"河北",'qq':''},
            {"code":"fj","name":"福建",'qq':''},
            {"code":"ln","name":"辽宁",'qq':''},
            {"code":"ah","name":"安徽",'qq':''},
            {"code":"cq","name":"重庆",'qq':''},
            {"code":"gx","name":"广西",'qq':''},
            {"code":"gz","name":"贵州",'qq':''},
            {"code":"gs","name":"甘肃",'qq':''},
            {"code":"hl","name":"黑龙江",'qq':''},
            {"code":"hb","name":"湖北",'qq':''},
            {"code":"hu","name":"湖南",'qq':''},
            {"code":"jl","name":"吉林",'qq':''},
            {"code":"nm","name":"内蒙古",'qq':''},
            {"code":"nx","name":"宁夏",'qq':''},
            {"code":"qh","name":"青海",'qq':''},
            {"code":"sx","name":"山西",'qq':''},
            {"code":"sc","name":"四川",'qq':''},
            {"code":"sa","name":"陕西",'qq':''},
            {"code":"xz","name":"西藏",'qq':''},
            {"code":"xj","name":"新疆",'qq':''},
            {"code":"yn","name":"云南",'qq':''},
            {"code":"jx","name":"江西",'qq':''},
        ]
        reply(citys);
    },
    config: {
        description: '获得所有省份列表'
    }
};