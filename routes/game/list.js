const Boom = require('boom');
const Joi = require('joi');
const _ = require('lodash');

module.exports = {
    path: '/api/game/list',
    method: 'GET',
    handler(request, reply) {
        const totle = 'select level,title,time,u.name,u.headimgurl from game g,user u where g.user_id=u.id  order by level desc,time asc limit 50';
        const week = 'select level,title,time,u.name,u.headimgurl from game g,user u where g.user_id=u.id and YEARWEEK(date_format(g.insert_date,\'%Y-%m-%d\')) = YEARWEEK(now())  order by level desc,time asc limit 50';
        const month = 'select level,title,time,u.name,u.headimgurl from game g,user u where g.user_id=u.id and DATE_FORMAT( g.insert_date, \'%Y%m\' ) = DATE_FORMAT( CURDATE( ) ,\'%Y%m\' )  order by level desc,time asc limit 50';

        request.app.db.query(totle, (err, tres) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                request.app.db.query(week, (err, wres) => {
                    if(err) {
                        request.log(['error'], err);
                        reply(Boom.serverUnavailable(config.errorMessage));
                    } else {
                        request.app.db.query(month, (err, mres) => {
                            if(err) {
                                request.log(['error'], err);
                                reply(Boom.serverUnavailable(config.errorMessage));
                            } else {
                                reply({ totle: tres, week: wres, month: mres });
                            }
                        });
                    }
                });
            }
        });
    },
    config: {
        description: '游戏排行'
    }
};
// SELECT * FROM game WHERE ;
// SELECT * FROM  game WHERE
