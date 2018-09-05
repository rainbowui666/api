const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const fs = require("fs");
const _ = require('lodash');
const cache = require("memory-cache");

module.exports = {
    path: '/api/material/random/imageList',
    method: 'GET',
    handler(request, reply) {
        let pathList = cache.get('material-hy-path');
        if(!pathList){
            pathList =[];
            const files = fs.readdirSync(config.material+ "/small/hy/");
            files.forEach(function(filename){
                const obj = {};
                obj.pic = "/small/hy/"+filename;
                obj.code = filename.substring(0,filename.indexOf(".")).split("-")[1];
                pathList.push(obj)
            });
            cache.put('material-hy-path',pathList);
        }
        

        // const easyList = ['dd','dxsx','dy','hyqt','zhy','lty','hjy','nqd','qd','gt','hl','hm','jly','sl','sy','tzd','wei','zhou'];
        const easyList = ['dd','dxsx','dy','hyqt','xxsx','zhy','lty'];

    
        const ran = Math.floor(Math.random() * (easyList.length));
        const typeRandom = easyList[ran];
    
        const mapselect = `select id,code,type,name from material where category='hy' and price>0 and  type='${typeRandom}' order by rand() limit 30`;
        request.app.db.query(mapselect, (err, mapres) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
               const returnMap = {};
               let index = 1;
               let count = 1;
               _.each(mapres,(mapre)=>{
                const returnObj = {};
                const path = _.find(pathList,(_path)=>{
                    return _path.code == mapre.code;
                });
                if(path){
                    returnObj.key=mapre.id;
                    returnObj.name=mapre.name;
                    returnObj.pic=path.pic;
                }else{
                    returnObj.key=330;
                    returnObj.name='夏威夷红圣诞龙';
                    returnObj.pic='/small/hy/1513179762-XWYHSDL.png';
                }


                if(count>10){
                    index+=1;
                    count=1;
                }
                count+=1;
                if(_.isEmpty(returnMap[`${index}`])){
                    returnMap[`${index}`]=[returnObj];
                }else{
                    returnMap[`${index}`].push(returnObj);
                }
            });
             
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
