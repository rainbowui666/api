const Boom = require('boom');

module.exports = {
    path: '/api/users/types',
    method: 'GET',
    handler(request, reply) {
        const typs = [
            {"code":"yy","name":"鱼友","desc":"可以参加团购"},
            {"code":"cjyy","name":"超级鱼友","desc":"可以参加团购"},
            {"code":"cjtz","name":"超级团长","desc":"可以参加团购，一键开团"},
            {"code":"fws","name":"服务商(本地)","desc":"可以参加团购、组织团购、上传普通出货单、一键开团"},
            {"code":"lss","name":"零售商(全国)","desc":"可以参加团购、组织团购、上传普通出货单、一键开团"},
            {"code":"pfs","name":"批发商","desc":"可以参加团购、组织团购、上传普通出货单、上传私有出货单、一键开团"},
            {"code":"qcs","name":"器材商","desc":"可以在商城发布商品"},
            {"code":"yhgly","name":"用户管理员","desc":"可以管理用户列表"},
            {"code":"jygly","name":"交易管理员","desc":"可以管理交易列表"},
            {"code":"hdgly","name":"活动管理员","desc":"可以管理活动列表"},
            {"code":"bkgly","name":"百科管理员","desc":"可以管理百科列表"},
            {"code":"tggly","name":"团购管理员","desc":"可以管理团购列表"},
            {"code":"admin","name":"超级管理员","desc":"可以管理团购列表"}
        ]
        reply(typs);
    },
    config: {
        description: '获得用户类型'
    }
};
