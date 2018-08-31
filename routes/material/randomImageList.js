const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const fs = require("fs");
const _ = require('lodash');

module.exports = {
    path: '/api/material/random/imageList',
    method: 'GET',
    handler(request, reply) {
        const pathList = [];
        const files = fs.readdirSync(config.material+ "/small/hy/");
        files.forEach(function(filename){
            const obj = {};
            obj.pic = "/small/hy/"+filename;
            obj.code = filename.substring(0,filename.indexOf(".")).split("-")[1];
            pathList.push(obj)
        });

        const easyList = ['dd','dxsx','dy','hjy','lty','nqd','pd','qd','xiaoc','xxsx','zhy','qw'];
        const middleList = ['awtl','hl','hz','qw','sby','sl','tzd','wei','ying','by','gt','jly'];
        const hardList = ['hyqt','hm','sy'];

        const typeRandom = [];
        for (let i = 0; i < 2; i++) {
            const ran = Math.floor(Math.random() * (easyList.length - i));
            typeRandom.push(easyList[ran]);
            easyList[ran] = easyList[easyList.length - i - 1];
        };
        for (let i = 0; i < 1; i++) {
            const ran = Math.floor(Math.random() * (middleList.length - i));
            typeRandom.push(middleList[ran]);
            middleList[ran] = middleList[middleList.length - i - 1];
        };
        for (let i = 0; i < 1; i++) {
            const ran = Math.floor(Math.random() * (hardList.length - i));
            typeRandom.push(hardList[ran]);
            hardList[ran] = hardList[hardList.length - i - 1];
        };
        const type = [" ("];
        _.each(typeRandom,(item)=>{
            type.push("'"+item+"',");
        });
        type.push("'a') ");
        const mapselect = `select id,code,type,name from material where category='hy' and price>0 and type in ${type.join("")}`;
        request.app.db.query(mapselect, (err, mapres) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
               const groups = {};
               const returnMap = {};
               _.each(mapres,(res)=>{
                    const group = groups[res.type];
                    if(group){
                        group.push(res);
                    }else{
                        groups[res.type]=[res];
                    }
               })
               _.each(_.keys(groups),(key,index)=>{
                    let temp = groups[key];
                    const group = [];
                    for (let i = 0; i < 10; i++) {
                        const ran = Math.floor(Math.random() * (temp.length - i));
                        group.push(temp[ran]);
                        temp[ran] = temp[temp.length - i - 1];
                    };
                    _.each(group,(gp)=>{
                        const returnObj = {};
                        const path = _.find(pathList,(_path)=>{
                            if(gp){
                                return _path.code == gp.code;
                            }
                        });
                        if(path){
                            returnObj.key=gp.id;
                            returnObj.name=gp.name;
                            returnObj.pic=path.pic;
                        }else{
                            returnObj.key=330;
                            returnObj.name='夏威夷红圣诞龙';
                            returnObj.pic='/small/hy/1513179762-XWYHSDL.png';
                        }
                        if(_.isEmpty(returnMap[`${index+1}`])){
                            returnMap[`${index+1}`]=[returnObj];
                        }else{
                            returnMap[`${index+1}`].push(returnObj);
                        }
                    });
               })
               reply(returnMap);
            }
        });
    },
    config: {
        description: ' 随机获得生物资料图片',
        validate: {
            query: {
                classification: Joi.number().default(0)
            }
        },
    }
};
