const Boom = require('boom');
const _ = require("lodash");

module.exports = {
    path: '/api/material/category/all',
    method: 'GET',
    handler(request, reply) {
        const categorys = [
            {"code":"hy","name":"海鱼","desc":""},
            {"code":"rt","name":"软体","desc":""},
            {"code":"yg","name":"硬骨","desc":""},
            {"code":"qt","name":"其他生物","desc":""},
            {"code":"hc","name":"耗材","desc":""},
            {"code":"sb","name":"设备","desc":""},

        ];
        const types = [
            {"code":"awtl","name":"凹尾塘鳢","desc":"","pc":"hy"},
            {"code":"bfy","name":"蝙蝠鱼","desc":"","pc":"hy"},
            {"code":"dxsx","name":"大型神仙","desc":"","pc":"hy"},
            {"code":"xxsx","name":"小型神仙","desc":"","pc":"hy"},
            {"code":"dd","name":"倒吊","desc":"","pc":"hy"},
            {"code":"dy","name":"蝶鱼","desc":"","pc":"hy"},
            {"code":"hjy","name":"海金鱼","desc":"","pc":"hy"},
            {"code":"hl","name":"海龙","desc":"","pc":"hy"},
            {"code":"hz","name":"花鮨","desc":"","pc":"hy"},
            {"code":"lty","name":"隆头鱼","desc":"","pc":"hy"},
            {"code":"nqd","name":"拟雀鲷","desc":"","pc":"hy"},
            {"code":"pd","name":"炮弹","desc":"","pc":"hy"},
            {"code":"qw","name":"青蛙","desc":"","pc":"hy"},
            {"code":"qd","name":"雀鲷","desc":"","pc":"hy"},
            {"code":"sby","name":"石斑鱼","desc":"","pc":"hy"},
            {"code":"sl","name":"石鲈","desc":"","pc":"hy"},
            {"code":"tzd","name":"天竺鲷","desc":"","pc":"hy"},
            {"code":"zhy","name":"虾虎鱼","desc":"","pc":"hy"},
            {"code":"wei","name":"鳚","desc":"","pc":"hy"},
            {"code":"xc","name":"箱鲀","desc":"","pc":"hy"},
            {"code":"ying","name":"鹰","desc":"","pc":"hy"},
            {"code":"zhou","name":"鲉","desc":"","pc":"hy"},
            {"code":"by","name":"壁鱼","desc":"","pc":"hy"},
            {"code":"gt","name":"狗头","desc":"","pc":"hy"},
            {"code":"xiaoc","name":"小丑","desc":"","pc":"hy"},
            {"code":"hm","name":"海鳗","desc":"","pc":"hy"},
            {"code":"sy","name":"鲨鱼","desc":"","pc":"hy"},
            {"code":"jly","name":"金鳞鱼","desc":"","pc":"hy"},
            {"code":"yy","name":"鳐鱼","desc":"","pc":"hy"},
            {"code":"hyqt","name":"其它","desc":"","pc":"hy"},
            {"code":"xia","name":"虾","desc":"","pc":"qt"},
            {"code":"xie","name":"蟹","desc":"","pc":"qt"},
            {"code":"luo","name":"螺","desc":"","pc":"qt"},
            {"code":"hg","name":"海龟","desc":"","pc":"qt"},
            {"code":"hc","name":"海草","desc":"","pc":"qt"},
            {"code":"hk","name":"海葵","desc":"","pc":"qt"},
            {"code":"hxia","name":"海虾","desc":"","pc":"qt"},
            {"code":"hd","name":"海胆","desc":"","pc":"qt"},
            {"code":"hx","name":"海星","desc":"","pc":"qt"},
            {"code":"hail","name":"海螺","desc":"","pc":"qt"},
            {"code":"haim","name":"海绵","desc":"","pc":"qt"},
            {"code":"gc","name":"管虫","desc":"","pc":"qt"},
            {"code":"px","name":"螃蟹","desc":"","pc":"qt"},
            {"code":"hs","name":"海参","desc":"","pc":"qt"},
            {"code":"sb","name":"扇贝","desc":"","pc":"qt"},
            {"code":"wzb","name":"五爪贝","desc":"","pc":"qt"},
            {"code":"hq","name":"海鞘","desc":"","pc":"qt"},
            {"code":"lx","name":"龙虾","desc":"","pc":"qt"},
            {"code":"wz","name":"乌贼","desc":"","pc":"qt"},
            {"code":"zy","name":"章鱼","desc":"","pc":"qt"},
            {"code":"sm","name":"水母","desc":"","pc":"qt"},
            {"code":"hky","name":"海蛞蝓","desc":"","pc":"qt"},
            {"code":"jpdw","name":"棘皮动物","desc":"","pc":"qt"},
            {"code":"qtqt","name":"其它","desc":"","pc":"qt"},
            {"code":"rtpicaol","name":"草皮","desc":"","pc":"rt"},
            {"code":"rtnaoleish","name":"脑类珊瑚","desc":"","pc":"rt"},
            {"code":"rtnaizuihk","name":"奶嘴海葵","desc":"","pc":"rt"},
            {"code":"rtniukou","name":"纽扣","desc":"","pc":"rt"},
            {"code":"rtgulei","name":"菇类","desc":"","pc":"rt"},
            {"code":"rtwanhuatsh","name":"万花筒珊瑚","desc":"","pc":"rt"},
            {"code":"rtpigel","name":"皮革类","desc":"","pc":"rt"},
            {"code":"rtshouzhil","name":"手指类","desc":"","pc":"rt"},
            {"code":"rtshuish","name":"海树海柳海绵","desc":"","pc":"rt"},
            {"code":"rtfeipanl","name":"飞盘类","desc":"","pc":"rt"},
            {"code":"rtlangtoush","name":"榔头珊瑚","desc":"","pc":"rt"},
            {"code":"rttizsh","name":"提子珊瑚","desc":"","pc":"rt"},
            {"code":"rthuochaitsh","name":"火柴头珊瑚","desc":"","pc":"rt"},
            {"code":"rtniluoh","name":"尼罗河","desc":"","pc":"rt"},
            {"code":"rthuapingwl","name":"花瓶蛙卵","desc":"","pc":"rt"},
            {"code":"rtqipaosh","name":"气泡珊瑚","desc":"","pc":"rt"},
            {"code":"rtguanchognsh","name":"管虫珊瑚","desc":"","pc":"rt"},
            {"code":"rtsqshou","name":"闪千手鬼爪","desc":"","pc":"rt"},
            {"code":"rtdxshouxh","name":"大小手星华","desc":"","pc":"rt"},
            {"code":"rtqianshoufo","name":"千手佛","desc":"","pc":"rt"},
            {"code":"rttaiyangh","name":"太阳树炮仗花","desc":"","pc":"rt"},
            {"code":"rtqt","name":"其它","desc":"","pc":"rt"},
            {"code":"rtwapiansh","name":"瓦片珊瑚","desc":"","pc":"yg"},
            {"code":"rtlujiaosh","name":"鹿角珊瑚","desc":"","pc":"yg"},
            {"code":"ygqt","name":"其它","desc":"","pc":"yg"},
            {"code":"dj","name":"灯具","desc":"","pc":"sb"},
            {"code":"sb","name":"水泵","desc":"","pc":"sb"},
            {"code":"df","name":"蛋分","desc":"","pc":"sb"},
            {"code":"hxt","name":"活性炭","desc":"","pc":"hc"},
            {"code":"mfs","name":"麦饭石","desc":"","pc":"hc"},
            {"code":"ys","name":"鱼食","desc":"","pc":"hc"},
            {"code":"yan","name":"盐","desc":"","pc":"hc"},
            {"code":"tjj","name":"添加剂","desc":"","pc":"hc"},
            {"code":"csj","name":"测试剂","desc":"","pc":"hc"}
        ];

        const returnList = [{"code":"rm","name":"热门","desc":"",'types':[{"code":'tj',"name":"推荐","desc":"","pc":"rm"},{"code":'tej',"name":'特价',"desc":"","pc":"rm"}]}];
        _.each(categorys,(category)=>{
            const type = _.filter(types,(type)=>{
                return type.pc==category.code;
            });
            category['types']=type;
            returnList.push(category);
        });
        reply({'status':'ok','categorys':returnList});
    },
    config: {
        description: '获得生物种类'
    }
};
