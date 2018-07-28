
const _ = require("lodash");
const Joi = require('joi');
module.exports = {
    path: '/api/tools/provinces/ad',
    method: 'GET',
    handler(request, reply) {
        const ads = [
            {"code":"sh","name":"上海",'ad':'1'},
            {"code":"bj","name":"北京",'ad':'1'},
            {"code":"hn","name":"河南",'ad':'1'},
            {"code":"js","name":"江苏",'ad':'1'},
            {"code":"zj","name":"浙江",'ad':'1'},
            {"code":"tj","name":"天津",'ad':'1'},
            {"code":"gd","name":"广东",'ad':'1'},
            {"code":"sd","name":"山东",'ad':'1'},
            {"code":"he","name":"河北",'ad':'1'},
            {"code":"fj","name":"福建",'ad':'1'},
            {"code":"ln","name":"辽宁",'ad':'1'},
            {"code":"ah","name":"安徽",'ad':'1'},
            {"code":"cq","name":"重庆",'ad':'1'},
            {"code":"gx","name":"广西",'ad':'1'},
            {"code":"gz","name":"贵州",'ad':'1'},
            {"code":"gs","name":"甘肃",'ad':'1'},
            {"code":"hl","name":"黑龙江",'ad':'1'},
            {"code":"hb","name":"湖北",'ad':'1'},
            {"code":"hu","name":"湖南",'ad':'1'},
            {"code":"jl","name":"吉林",'ad':'1'},
            {"code":"nm","name":"内蒙古",'ad':'1'},
            {"code":"nx","name":"宁夏",'ad':'1'},
            {"code":"qh","name":"青海",'ad':'1'},
            {"code":"sx","name":"山西",'ad':'1'},
            {"code":"sc","name":"四川",'ad':'1'},
            {"code":"sa","name":"陕西",'ad':'1'},
            {"code":"xz","name":"西藏",'ad':'1'},
            {"code":"xj","name":"新疆",'ad':'1'},
            {"code":"yn","name":"云南",'ad':'1'},
            {"code":"jx","name":"江西",'ad':'1'},
        ];

        let _ad = _.find(ads,(item)=>{
            return item.code==request.query.code;
        });

        if(_.isEmpty(_ad)){
            _ad =  {"code":"sh","name":"上海",'ad':'1'}
        }

        reply({'status':'ok','ad_num':_ad.ad});
    },
    config: {
        description: '获得所有省份列表',
        validate: {
            query: {
                code: Joi.string().required()
            }
        },
    }
};