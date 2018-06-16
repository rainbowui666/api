const Boom = require('boom');
const Joi = require('joi');

module.exports = {
    path: '/api/users/qq',
    method: 'GET',
    handler(request, reply) {
        const qqs = [
            {"id":"123456789","name":"鱼友交流群","desc":"可以参加团购",'province':'sh','logo':'base64'},
            {"id":"243702940","name":"海底牧场","desc":"  www.pcseaz.com ，我们的海水鱼论坛",'province':'sh','logo':''}, 
            {"id":"419909779","name":"新乡礁岩海水","desc":"这里只谈海水。观海无需长途跋涉，家中即是海底世界。",'province':'hn','logo':''}, 
            {"id":"262046786","name":"上海礁岩海水","desc":" 欢迎大家进入海水世界",'province':'sh','logo':''}, 
            {"id":"341063292","name":"北京礁岩海水","desc":"定期组织器材交流，生物交流，经验交流，总之各种交流！还有最重要的线下FB活动！",'province':'bj','logo':''},
            {"id":"98988255","name":"ZMF海水牧场","desc":"ZMF海水牧场让梦幻海景融入每个水族爱好者的家居中，享受天然的乐趣！",'province':'sd','logo':''},
            {"id":"348443","name":"纽扣花园","desc":"国内唯一的纽扣正名组织、纽扣珊瑚专业交流平台！",'province':'bj','logo':''},
            {"id":"78554746","name":"厦门海水与团购","desc":"群主很懒,什么都没有留下",'province':'fj','logo':''},
            {"id":"126508622","name":"昆明公子海水鱼","desc":"昆明海水鱼友群",'province':'yn','logo':''},
            {"id":"625988577","name":"成都平价海水团购","desc":"heaven in sea",'province':'cd','logo':''},
            {"id":"131852199","name":"广州蓝海树海水交流群","desc":"欢迎广大玩家交流学习！专营sps，lps，设备",'province':'gd','logo':''},
            {"id":"302340325","name":"贵州海洋鱼友乌托邦","desc":"此群不加商家，也不是商业群！",'province':'gz','logo':''},
            {"id":"277891337","name":"海水鱼","desc":"群主不常在线，要找群主可以加V：macjianxin",'province':'gd','logo':''},
            {"id":"439107825","name":"礁岩海水焦作海水群","desc":"海水设备及生物交流、团购等线上线下活动。",'province':'hn','logo':''},
            {"id":"144510587","name":"齐齐哈尔海水鱼群","desc":"海水交流",'province':'hl','logo':''},
            {"id":"285734316","name":"太原海水鱼","desc":"本群海水鱼学术交流群大家有什么好的建议！提",'province':'sh','logo':''},
            {"id":"462267546","name":"温州海水德云社","desc":"温州地区鱼友",'province':'zj','logo':''},
            {"id":"111591811","name":"徐州鱼乐圈@海水吧","desc":"集大海之美丽于一角，探大海之神秘于一处 ～～～保护海洋，从认识它开始各路鱼友加入大鹏海水吧，每周固定购",'province':'js','logo':''},
            {"id":"147602996","name":"重庆海水珊瑚团购","desc":"菲律宾、美国线、珊瑚全重庆最低折扣代出售 ",'province':'cq','logo':''},
            {"id":"264183629","name":"隔壁海水神教","desc":"海水鱼珊瑚饲养讨论，欢迎各位鱼友发表转载各类饲养经验及学术文献！",'province':'sc','logo':''},
            {"id":"522878742","name":"海水鱼友吧","desc":"欢迎所有对海水鱼的朋友入加, 享分自己FOT LPS SPS缸的心得。",'province':'gz','logo':''},
            {"id":"30548330","name":"海水鱼吧二号群","desc":"每个人都可以拥有一个海。本群为海水爱好者交流群",'province':'zj','logo':''},
            {"id":"15746299","name":"海水鱼发烧友交流群","desc":"希望大家在这里可以学习。交流技术 人人可以拥有一个海洋。",'province':'he','logo':''},
            {"id":"476363824","name":"嘉定海水鱼","desc":"方便嘉定地区海水鱼友交流经验 ",'province':'sh','logo':''},
            {"id":"194203870","name":"龙巅海水鱼","desc":"本群为龙巅海水鱼友交流群",'province':'sx','logo':''},
            {"id":"308697838","name":"济南海水鱼团购交流群","desc":"济南本地鱼友经验交流、设备交流、生物交流！团购生物！",'province':'sd','logo':'base64'},
            {"id":"371254101","name":"武汉海水鱼珊瑚","desc":"武汉金色海岸专业海水鱼、珊瑚交流群",'province':'hb','logo':''},
            {"id":"284701055","name":"北京海水鱼爱好者联盟","desc":"已经下海很久，或者刚下海的鱼友们可以在一起交流心得，让我们的家庭小水族炫丽缤",'province':'bj','logo':''},
            {"id":"146778604","name":"福州海水鱼珊瑚群","desc":"福州地区及福建省内海水鱼、珊瑚等海水生物玩家学习交流群",'province':'fj','logo':''},
            {"id":"365433019","name":"西安KK海养馆珊瑚群","desc":"建立一个西北五省最热闹的海水群，让大家少走弯路，以最少的钱，养最牛逼的珊瑚！",'province':'sa','logo':''},
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
