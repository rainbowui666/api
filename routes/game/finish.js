const Boom = require('boom');
const Joi = require('joi');
const _ = require("lodash");

module.exports = {
    path: '/api/game/finish',
    method: 'GET',
    handler(request, reply) {
        const select = `select id,level,title,user_id,time from game where user_id='${request.query.user_id}'`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                if(_.isEmpty(res)){
                    const insert = `insert into game(user_id,level,title,time) values(${request.query.user_id},'${request.query.level}','${request.query.title}',${request.query.time})`;
                    request.app.db.query(insert, (err, insertres) => {
                        if(err) {
                            request.log(['error'], err);
                            reply(Boom.serverUnavailable(config.errorMessage));
                        } else {
                            reply({'status':'ok'});
                        }
                    });
                }else{
                    const level = res[0].level;
                    const time = res[0].time;
                    if(Number(level)<Number(request.query.level)||(Number(level)==Number(request.query.level)&&Number(time)>Number(request.query.time))){
                        const deletesql = `delete from game where id=`+res[0].id;
                        request.app.db.query(deletesql, (err, deleteres) => {
                            if(err) {
                                request.log(['error'], err);
                                reply(Boom.serverUnavailable(config.errorMessage));
                            } else {
                                const insert = `insert into game(user_id,level,title,time) values(${request.query.user_id},'${request.query.level}','${request.query.title}',${request.query.time})`;
                                request.app.db.query(insert, (err, insertres) => {
                                    if(err) {
                                        request.log(['error'], err);
                                        reply(Boom.serverUnavailable(config.errorMessage));
                                    } else {
                                        reply({'status':'ok'});
                                    }
                                });
                            }
                        });
                    }
                }
            }
        });
        
    },
    config: {
        description: '游戏结束',
        validate: {
            query: {
                level: Joi.number().required(),
                title: Joi.string(),
                user_id: Joi.number().required(),
                time: Joi.number(),
            }
        },
    }
};

