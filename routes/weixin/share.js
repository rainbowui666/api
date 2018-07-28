const Joi = require('joi');
const Boom = require('boom');
const _ = require('lodash');
const config = require('../../config.js');
const util = require('../../lib/util.js');
const https = require('https');
const qs = require('querystring');  
const cache = require("memory-cache");
const crypto = require('crypto');

const getSignature = function(ticket,request,reply){
    const tepStr = `jsapi_ticket=${ticket}&noncestr=huanjiaohu&timestamp=${request.query.timestamp}&url=https://test.huanjiaohu.com/`;
    console.log(tepStr)
	const md5sum = crypto.createHash('sha1');
	md5sum.update(tepStr);
	const str = md5sum.digest('hex');
	reply({'status':'ok','signature':str});
}

const getTicket = function(access_token,request,reply){
    const ticket = cache.get('ticket');
    if(ticket){
        getSignature(ticket,request,reply);
    }else{
        const queryDate = {  
            access_token: access_token,  
            type: 'jsapi',
        };
        const content = qs.stringify(queryDate);  
        const options = {
            hostname: "api.weixin.qq.com",
            port: 443,				
            path: '/cgi-bin/ticket/getticket?'+content,				
            method: "GET",		
            json: true,				
            rejectUnauthorized: true,  
        }
        const req = https.request(options, function (res) {  
            res.setEncoding('utf8');  
            res.on('data', function (ticketData) {
                const ticketObj = JSON.parse(ticketData);
                cache.put('ticket',ticketObj.ticket,7200, function(key, value) {
                    console.log(key + ' lost ' + value);
                });
                getSignature(ticketObj.ticket,request,reply);
            });   
        });   
    
        req.on('error', function (e) {  
            console.log('problem with request: ' + e.message);  
            reply(Boom.notAcceptable('调用微信出错'));

        });  
          
        req.end(); 
    }
    
   
}

module.exports = {
    path: '/api/weixin/share',
    method: 'GET',
    handler(request, reply) {

        const token = cache.get('token');
        if(token){
            getTicket(token,request,reply);
        }else{
            const queryDate = {  
                appid: 'wx6edb9c7695fb8375',  
                secret: '3e7b1b2235b7fdeed18afbb299a64683',
                grant_type:'client_credential'
            };
            const content = qs.stringify(queryDate);  
            const options = {
                hostname: "api.weixin.qq.com",
                port: 443,				
                path: '/cgi-bin/token?'+content,				
                method: "GET",		
                json: true,				
                rejectUnauthorized: true,  
            }
            const req = https.request(options, function (res) {  
                res.setEncoding('utf8');  
                res.on('data', function (tokenData) { 
                    const tonkenObj = JSON.parse(tokenData);
                    cache.put('token',tonkenObj.access_token,7200, function(key, value) {
                        console.log(key + ' lost ' + value);
                    });
                    getTicket(tonkenObj.access_token,request,reply);
                });   
            });   
    
            req.on('error', function (e) {  
                console.log('problem with request: ' + e.message);  
                reply(Boom.notAcceptable('调用微信出错'));
            });  
              
            req.end();  
        }
        
      
        
    },
    config: {
        description: '微信根据code获得openid',
        validate: {
            query: {
                timestamp: Joi.string().required()
            }
        }
    }
};

