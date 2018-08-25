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

        const typeList = ['dd','dxsx','dy','hjy','hyqt','lty','nqd','pd','qd','xiaoc','xxsx','zhy'];
        const typeRandom = [];
        for (let i = 0; i < 4; i++) {
            const ran = Math.floor(Math.random() * (typeList.length - i));
            typeRandom.push(typeList[ran]);
            typeList[ran] = typeList[typeList.length - i - 1];
        };
        const type = [" ("];
        _.each(typeRandom,(item)=>{
            type.push("'"+item.type+"',");
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
                            return _path.code == gp.code;
                        });
                        if(path){
                            returnObj.key=gp.id;
                            returnObj.name=gp.name;
                            returnObj.pic=path.pic;
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
