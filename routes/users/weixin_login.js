const Joi = require('joi');
const Boom = require('boom');
const JWT = require('jsonwebtoken');
const config = require('../../config.js');
const util = require('../../lib/util.js');
const https = require('https');
const qs = require('querystring');  


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
                const chenkObj =JSON.parse(chunk);
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
                        //===user==== {"openid":"ohGtg1o1F-fgzmbXElW1fbFNvdDg","nickname":"张海斌, Tony","sex":1,"language":"zh_CN","city":"宝山","province":"上海","country":"中国","headimgurl":"http:\/\/thirdwx.qlogo.cn\/mmopen\/vi_32\/DYAIOgq83eqdiadVl5GHwqyN5hAQZW7Rc8Zp6Ug0ichuCNovU6wBfzJWHCpKibGt0vfBlfw9uHk86RWibelRR0FRIg\/132","privilege":[]}
                        
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


