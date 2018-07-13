const Joi = require('joi');
const Boom = require('boom');
const _ = require('lodash');
const config = require('../../config.js');
const util = require('../../lib/util.js');
const https = require('https');
const qs = require('querystring');  
const JWT = require('jsonwebtoken');

const TOKEN_TTL = '43200m';
const md5 = require('md5');

const login = function(user,request,reply){
    if(Number(user.status)==0){
        reply(Boom.notAcceptable('该用户已经失效请联系管理员'));
    }else{
        const options = {
            expiresIn: TOKEN_TTL
        };
        const session = {
            id: user.id,
            username: user.name,
            type :user.type
        };
        const token = JWT.sign(session, config.authKey, options);
        const key = util.buildKey(request)+'token';
        global.globalCahce.set(key, token);
        const res = {
            token,
            "status": "ok",
            "id":user.id
        };
        reply(res);
    }
   
}
module.exports = {
    path: '/api/users/login/byCode',
    method: 'GET',
    handler(request, reply) {
        const queryDate = {  
            appid: 'wx9f635f06da7360d7',  
            secret: 'f233bf61590a9ba1b310e9fc0542ca1e',
            js_code:request.query.code,
            grant_type:'authorization_code'
        };

        const content = qs.stringify(queryDate);  

        const options = {
            hostname: "api.weixin.qq.com",
            port: 443,				
            path: '/sns/jscode2session?'+content,				
            method: "GET",		
            json: true,				
            rejectUnauthorized: true,  
        }
        const req = https.request(options, function (res) {  
            res.setEncoding('utf8');  
            res.on('data', function (userChunk) { 
                console.log("==token=="+userChunk)

                // {"session_key":"LaQD09QY9+8XqY3tXnTaeA==","openid":"oeSe94uLH-KrxqGfMIao6l-x1b9U","unionid":"ohbZ81rojJDLl6nZVjzIldmw5bMk"}
                const userObject = JSON.parse(userChunk);
                console.log("==user=="+userObject)
                if(userObject.openid){
                        const selectUser = `select id,name,status,type from user where  openid='${userObject.openid}'`;
                        request.app.db.query(selectUser, (err, res) => {
                            if(err) {
                                request.log(['error'], err);
                                reply(Boom.serverUnavailable(config.errorMessage));
                            } else {
                                if(!_.isEmpty(res)){
                                    login(res[0],request,reply);
                                }else{
                                    // reply({"status": "ok"});
                                    login({id:1,name:"11",status:1,type:'yy'},request,reply);
                                }
                            }
                        });
                }else{
                    reply(Boom.notAcceptable('微信登录失败'));
                }

            });   
        });   

        req.on('error', function (e) {  
            console.log('problem with request: ' + e.message);  
        });  
          
        req.end();  
        
    },
    config: {
        description: '微信根据code获得openid',
        validate: {
            query: {
                code: Joi.string().required(),
            }
        }
    }
};

