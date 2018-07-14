const Boom = require('boom');
const Joi = require('joi');
const _ = require('lodash');
let provinces = [];
const getProvinces = (code) => {
    return _.find(provinces,(item)=>{
        return item.mark==code;
    });
}
module.exports = {
    path: '/api/users/qq',
    method: 'GET',
    handler(request, reply) {
        const qqs = [
            {"id":"243702940","name":"海底牧场","desc":"  www.pcseaz.com ，我们的海水鱼论坛",'province':'sh','type':'qq'}, 
            {"id":"419909779","name":"新乡礁岩海水","desc":"这里只谈海水。观海无需长途跋涉，家中即是海底世界。",'province':'hn','type':'qq'}, 
            {"id":"262046786","name":"上海礁岩海水","desc":" 欢迎大家进入海水世界",'province':'sh','type':'qq'}, 
            {"id":"341063292","name":"北京礁岩海水","desc":"定期组织器材交流，生物交流，经验交流，总之各种交流！还有最重要的线下FB活动！",'province':'bj','type':'qq'},
            {"id":"98988255","name":"ZMF海水牧场","desc":"ZMF海水牧场让梦幻海景融入每个水族爱好者的家居中，享受天然的乐趣！",'province':'sd','type':'qq'},
            {"id":"348443","name":"纽扣花园","desc":"国内唯一的纽扣正名组织、纽扣珊瑚专业交流平台！",'province':'bj','type':'qq'},
            {"id":"78554746","name":"厦门海水与团购","desc":"群主很懒,什么都没有留下",'province':'fj','type':'qq'},
            {"id":"126508622","name":"昆明公子海水鱼","desc":"昆明海水鱼友群",'province':'yn','type':'qq'},
            {"id":"625988577","name":"成都平价海水团购","desc":"heaven in sea",'province':'cd','type':'qq'},
            {"id":"131852199","name":"广州蓝海树海水交流群","desc":"欢迎广大玩家交流学习！专营sps，lps，设备",'province':'gd','type':'qq'},
            {"id":"302340325","name":"贵州海洋鱼友乌托邦","desc":"此群不加商家，也不是商业群！",'province':'gz','type':'qq'},
            {"id":"277891337","name":"海水鱼","desc":"群主不常在线，要找群主可以加V：macjianxin",'province':'gd','type':'qq'},
            {"id":"439107825","name":"礁岩海水焦作海水群","desc":"海水设备及生物交流、团购等线上线下活动。",'province':'hn','type':'qq'},
            {"id":"144510587","name":"齐齐哈尔海水鱼群","desc":"海水交流",'province':'hl','type':'qq'},
            {"id":"285734316","name":"太原海水鱼","desc":"本群海水鱼学术交流群大家有什么好的建议！提",'province':'sh','type':'qq'},
            {"id":"462267546","name":"温州海水德云社","desc":"温州地区鱼友",'province':'zj','type':'qq'},
            {"id":"111591811","name":"徐州鱼乐圈@海水吧","desc":"集大海之美丽于一角，探大海之神秘于一处 ～～～保护海洋，从认识它开始各路鱼友加入大鹏海水吧，每周固定购",'province':'js','type':'qq'},
            {"id":"147602996","name":"重庆海水珊瑚团购","desc":"菲律宾、美国线、珊瑚全重庆最低折扣代出售 ",'province':'cq','type':'qq'},
            {"id":"264183629","name":"隔壁海水神教","desc":"海水鱼珊瑚饲养讨论，欢迎各位鱼友发表转载各类饲养经验及学术文献！",'province':'sc','type':'qq'},
            {"id":"522878742","name":"海水鱼友吧","desc":"欢迎所有对海水鱼的朋友入加, 享分自己FOT LPS SPS缸的心得。",'province':'gz','type':'qq'},
            {"id":"30548330","name":"海水鱼吧二号群","desc":"每个人都可以拥有一个海。本群为海水爱好者交流群",'province':'zj','type':'qq'},
            {"id":"15746299","name":"海水鱼发烧友交流群","desc":"希望大家在这里可以学习。交流技术 人人可以拥有一个海洋。",'province':'he','type':'qq'},
            {"id":"476363824","name":"嘉定海水鱼","desc":"方便嘉定地区海水鱼友交流经验 ",'province':'sh','type':'qq'},
            {"id":"194203870","name":"龙巅海水鱼","desc":"本群为龙巅海水鱼友交流群",'province':'sx','type':'qq'},
            {"id":"308697838","name":"济南海水鱼团购交流群","desc":"济南本地鱼友经验交流、设备交流、生物交流！团购生物！",'province':'sd','type':'qq'},
            {"id":"371254101","name":"武汉海水鱼珊瑚","desc":"武汉金色海岸专业海水鱼、珊瑚交流群",'province':'hb','type':'qq'},
            {"id":"284701055","name":"北京海水鱼爱好者联盟","desc":"已经下海很久，或者刚下海的鱼友们可以在一起交流心得，让我们的家庭小水族炫丽缤",'province':'bj','type':'qq'},
            {"id":"146778604","name":"福州海水鱼珊瑚群","desc":"福州地区及福建省内海水鱼、珊瑚等海水生物玩家学习交流群",'province':'fj','type':'qq'},
            {"id":"365433019","name":"西安KK海养馆珊瑚群","desc":"建立一个西北五省最热闹的海水群，让大家少走弯路，以最少的钱，养最牛逼的珊瑚！",'province':'sa','type':'qq'},
            {"id":"364473906","name":"成都·海水鱼友群","desc":"希望大家能在这交到好朋友造出精品缸养出状态一流的鱼！！！",'province':'sa','type':'qq'},
            {"id":"302885505","name":"大庆海水鱼团购交流群","desc":"团购生物，鱼友交流，鱼友生物交易",'province':'sa','type':'qq'},
            {"id":"322507786","name":"海水鱼吧三号群","desc":"每个人都可以拥有一个海！",'province':'sa','type':'qq'},
            {"id":"24281638","name":"海友志海水鱼友讨论群","desc":"海友志—海水鱼友综合讨论群，欢迎您的加入！为广大海水鱼及珊瑚爱好者而建立，结合众海友们自身认知的海洋资讯、生物资料、技术设备、饲养心得、美缸分享等讨论，作为即时交流的QQ群平台。",'province':'sa','type':'qq'},
            {"id":"112194842","name":"花海精品水族","desc":"最真实的海水 最漂亮的珊瑚，欢迎热爱海水的朋友来打造同一片海洋。",'province':'sa','type':'qq'},
            {"id":"332448204","name":"济宁海水鱼珊瑚交流群","desc":"济宁及周边地区海水鱼、海缸交流群",'province':'sa','type':'qq'},
            {"id":"162710238","name":"开封海水观赏鱼","desc":"群里只为各位鱼友提供一个相互学习、交流、展示的平台。",'province':'sa','type':'qq'},
            {"id":"31778963","name":"沈阳海水鱼珊瑚团购","desc":"沈阳地区海水鱼珊瑚，不定期集体团购，",'province':'sa','type':'qq'},
            {"id":"569477929","name":"天津海水鱼团购，批发","desc":"天津海水生物团购，欢迎周边商家，团长来",'province':'sa','type':'qq'},
            {"id":"flyingcloud1202","name":"怡","desc":"上海月亮公主",'province':'sh','type':'wx'},
            {"id":"frankchenmin1987","name":"陈旻","desc":"上海frank",'province':'sh','type':'wx'},
            {"id":"tony198511","name":"Qi","desc":"上海Qi",'province':'sh','type':'wx'},
            {"id":"hirzhang","name":"Hiro","desc":"上海Hiro",'province':'sh','type':'wx'},
            {"id":"silent_tear","name":"小拧","desc":"上海小拧",'province':'sh','type':'wx'},
            {"id":"laoying6885","name":"机场上空的鹰","desc":"北京老鹰",'province':'bj','type':'wx'},
            {"id":"carnation-bobo","name":"康乃馨","desc":"北京恶人谷",'province':'bj','type':'wx'},
            {"id":"lishuanding","name":"yufan","desc":"北京yufan",'province':'bj','type':'wx'},
            {"id":"silentryx","name":"金属","desc":"北京钢铁",'province':'bj','type':'wx'},
            {"id":"wxid_qc0b89a4a1se21","name":"绿豆冰","desc":"北京糖果",'province':'bj','type':'wx'},
            {"id":"zxc369369","name":"阿帅","desc":"郑州阿帅",'province':'hn','type':'wx'},
            {"id":"d8899888","name":"哎呀我的腰","desc":"郑州小白",'province':'hn','type':'wx'},
            {"id":"coral_shenlan","name":"月光","desc":"新乡月光",'province':'hn','type':'wx'},
            {"id":"chenkai19841015","name":"凯凯","desc":"南京凯凯",'province':'js','type':'wx'},
            {"id":"china911king","name":"911king","desc":"南京911king",'province':'js','type':'wx'},
            {"id":"z18605168688","name":"如鱼得水~张国鹏","desc":"徐州大鹏海水吧",'province':'js','type':'wx'},
            {"id":"chenxiang130","name":"masavs pos","desc":"厦门masa",'province':'fj','type':'wx'},
        ]
        const fiterqq = _.filter(qqs,(qq)=>{
            return qq.province==request.query.province&&qq.type==request.query.type;
        });
        _.each(fiterqq,(item)=>{
            item['province']= getProvinces(item.province);
        });
        reply(fiterqq);
    },
    config: {
        description: '获得用户类型',
        validate: {
            query: {
                province: Joi.string().required(),
                type: Joi.string().required()
            }
        },
        pre: [
            {
                method(request, reply) {
                    const select = `select mark,name from citys where type=1`;
                    request.app.db.query(select, (err, res) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else {
                            provinces =res;
                            reply(true);
                        }
                    });
                }
            }
        ]
    }
};
