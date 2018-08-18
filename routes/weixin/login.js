const Joi = require('joi');
const Boom = require('boom');
const _ = require('lodash');
const config = require('../../config.js');
const util = require('../../lib/util.js');
const https = require('https');
const qs = require('querystring');  
const JWT = require('jsonwebtoken');

const TOKEN_TTL = '43200m';

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
            "province":user.province,
            "id":user.id
        };
        reply(res);
    }
   
}
module.exports = {
    path: '/api/users/login/weixin',
    method: 'GET',
    handler(request, reply) {
        const queryDate = {  
            appid: 'wx6edb9c7695fb8375',  
            secret: '3e7b1b2235b7fdeed18afbb299a64683',
            code:request.query.code,
            grant_type:'authorization_code'
        };

        const content = qs.stringify(queryDate);  

        const options = {
            hostname: "api.weixin.qq.com",
            port: 443,				
            path: '/sns/oauth2/access_token?'+content,				
            method: "GET",		
            json: true,				
            rejectUnauthorized: true,  
        }
        const req = https.request(options, function (res) {  
            res.setEncoding('utf8');  
            res.on('data', function (chunk) { 
                // console.log("==token=="+chunk)

                const chenkObj =JSON.parse(chunk);
                // console.log("==token=2="+chenkObj.access_token)

                const userDate = {  
                    access_token: chenkObj.access_token,  
                    openid: chenkObj.openid,
                    lang:'zh_CN'
                };
        
                const userContent = qs.stringify(userDate);  
                const userOptions = {
                    hostname: "api.weixin.qq.com", 
                    port: 443,				
                    path: '/sns/userinfo?'+userContent,			
                    method: "GET",		
                    json: true,				
                    rejectUnauthorized: true,  
                }

                var userReq = https.request(userOptions, function (userRes) {  
                    userRes.setEncoding('utf8');  
                    userRes.on('data', function (userChunk) {  
                        // console.log("==user=="+userChunk)
                        const userObject = JSON.parse(userChunk);
                        // console.log("==user=="+userObject)
                        if(userObject.openid){
                            const selectUser = `select id,name,status,type,province from user where  openid='${userObject.openid}'`;
                                request.app.db.query(selectUser, (err, res) => {
                                    if(err) {
                                        request.log(['error'], err);
                                        reply(Boom.serverUnavailable(config.errorMessage));
                                    } else {
                                        if(_.isEmpty(res)){
                                            const insert = `select mark from citys where name='${userObject.city}'`;
                                            request.app.db.query(insert, (err, city) => {
                                                if(err) {
                                                    request.log(['error'], err);
                                                    reply(Boom.serverUnavailable(config.errorMessage));
                                                } else {
                                                    const province = _.find(util.provinces(),(item)=>{
                                                        return item.name==userObject.province;
                                                    });
                                                    if(_.isEmpty(city[0])&&userObject.province=='上海'){
                                                        city[0]={mark:'shc'}
                                                    }
                                                    if(_.isEmpty(city[0])&&userObject.province=='北京'){
                                                        city[0]={mark:'bjc'}
                                                    }
                                                    const insert = `insert into user (name,password,city,phone,type,province,sex,headimgurl,openid,country,province_name,city_name) VALUES('${userObject.nickname}','0ff8ecf84a686258caeb350dbc8040d6','${city[0]?city[0].mark:"shc"}','18888888888','yy','${province?province.code:"sh"}',${userObject.sex},'${userObject.headimgurl}','${userObject.openid}','${userObject.country}','${userObject.province}','${userObject.city}')`;
                                                    request.app.db.query(insert, (err, insertRes) => {
                                                        if(err) {
                                                            request.log(['error'], err);
                                                            reply(Boom.serverUnavailable(config.errorMessage));
                                                        } else {
                                                            const user = {
                                                                id:insertRes.insertId,
                                                                name:userObject.nickname,
                                                                province:province?province.code:"sh",
                                                                status:1,
                                                                type:'yy'
                                                            }
                                                            login(user,request,reply);
                                                        }
                                                    });
                                                }
                                            });
                                        
                                        }else{
                                            login(res[0],request,reply);
                                        }
                                    }
                                });
                        }else{
                            reply(Boom.notAcceptable('微信登录失败'));
                        }
                        
                    });   
                });   

                userReq.on('error', function (e) {  
                    console.log('problem with user request: ' + e.message);  
                });  
                  
                userReq.end();  


            });   
        });   

        req.on('error', function (e) {  
            console.log('problem with request: ' + e.message);  
        });  
          
        req.end();  
        
    },
    config: {
        description: '微信登陆',
        validate: {
            query: {
                code: Joi.string().required(),
            }
        }
    }
};

