const Boom = require('boom');
const Joi = require('joi');

module.exports = {
    path: '/api/users/group',
    method: 'GET',
    handler(request, reply) {
        const qqs = [
            {"id":"flyingcloud1202","name":"怡","desc":"上海月亮公主",'province':'sh','logo':'base64'},
            {"id":"frankchenmin1987","name":"陈旻","desc":"上海frank",'province':'sh','logo':'base64'},
            {"id":"tony198511","name":"Qi","desc":"上海Qi",'province':'sh','logo':'base64'},
            {"id":"hirzhang","name":"Hiro","desc":"上海Hiro",'province':'sh','logo':'base64'},
            {"id":"silent_tear","name":"小拧","desc":"上海小拧",'province':'sh','logo':'base64'},
            {"id":"laoying6885","name":"机场上空的鹰","desc":"北京老鹰",'province':'bj','logo':'base64'},
            {"id":"carnation-bobo","name":"康乃馨","desc":"北京恶人谷",'province':'bj','logo':'base64'},
            {"id":"lishuanding","name":"yufan","desc":"北京yufan",'province':'bj','logo':'base64'},
            {"id":"silentryx","name":"金属","desc":"北京钢铁",'province':'bj','logo':'base64'},
            {"id":"wxid_qc0b89a4a1se21","name":"绿豆冰","desc":"北京糖果",'province':'bj','logo':'base64'},
            {"id":"zxc369360","name":"阿帅","desc":"郑州阿帅",'province':'hn','logo':'base64'},
            {"id":"d8899888","name":"哎呀我的腰","desc":"郑州小白",'province':'hn','logo':'base64'},
            {"id":"coral_shenlan","name":"月光","desc":"新乡月光",'province':'hn','logo':'base64'},
            {"id":"chenkai19841015","name":"凯凯","desc":"南京凯凯",'province':'js','logo':'base64'},
            {"id":"china911king","name":"911king","desc":"南京911king",'province':'js','logo':'base64'},
            {"id":"z18605168688","name":"如鱼得水~张国鹏","desc":"徐州大鹏海水吧",'province':'js','logo':'base64'},
            {"id":"chenxiang130","name":"masavs pos","desc":"厦门masa",'province':'fj','logo':'base64'},
        ]
        reply(_.find(qqs,(qq)=>{
            return qq.province==request.query.province;
        }));
    },
    config: {
        description: '获得用户类型',
        validate: {
            query: {
                province: Joi.string().required()
            }
        }
    }
};
