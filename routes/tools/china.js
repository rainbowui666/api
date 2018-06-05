const Boom = require('boom');
const _ = require("lodash");
const cache = require("memory-cache");

module.exports = {
    path: '/api/tools/china',
    method: 'GET',
    handler(request, reply) {
        const chinas = cache.get("china");
        if(chinas){
            reply(chinas);
        }else{
            const china = [
                {"value":"sh","name":"上海",'parent':0},
                {"value":"bj","name":"北京",'parent':0},
                {"value":"hn","name":"河南",'parent':0},
                {"value":"js","name":"江苏",'parent':0},
                {"value":"zj","name":"浙江",'parent':0},
                {"value":"tj","name":"天津",'parent':0},
                {"value":"gd","name":"广东",'parent':0},
                {"value":"sd","name":"山东",'parent':0},
                {"value":"he","name":"河北",'parent':0},
                {"value":"fj","name":"福建",'parent':0},
                {"value":"ln","name":"辽宁",'parent':0},
                {"value":"ah","name":"安徽",'parent':0},
                {"value":"cq","name":"重庆",'parent':0},
                {"value":"gx","name":"广西",'parent':0},
                {"value":"gz","name":"贵州",'parent':0},
                {"value":"gs","name":"甘肃",'parent':0},
                {"value":"hl","name":"黑龙江",'parent':0},
                {"value":"hb","name":"湖北",'parent':0},
                {"value":"hu","name":"湖南",'parent':0},
                {"value":"jl","name":"吉林",'parent':0},
                {"value":"nm","name":"内蒙古",'parent':0},
                {"value":"nx","name":"宁夏",'parent':0},
                {"value":"qh","name":"青海",'parent':0},
                {"value":"sx","name":"山西",'parent':0},
                {"value":"sc","name":"四川",'parent':0},
                {"value":"sa","name":"陕西",'parent':0},
                {"value":"xz","name":"西藏",'parent':0},
                {"value":"xj","name":"新疆",'parent':0},
                {"value":"yn","name":"云南",'parent':0},
                {"value":"jx","name":"江西",'parent':0},
            ];
            const select = `select mark,name,area,type from citys`;
            request.app.db.query(select, (err, res) => {
                 _.each(res,(item)=>{
                     if(item.type==2){
                        china.push( {"value":item.mark,"name":item.name,'parent':item.area});
                     }
                 });
                 cache.put("china",china);
                 reply(china);
            });
        }
    },
    config: {
        description: '获得全国所有省份列表'
    }
};