const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const fs = require("fs");
const cache = require("memory-cache");

module.exports = {
    path: '/api/users/get/pay',
    method: 'GET',
    handler(request, reply) {
        const decodeImg = cache.get("pay"+request.query.id);
        if(decodeImg){
            reply(decodeImg).type('image/png');
        }else{

            const select = `select pay_type from user where id=${request.query.id}`;
            request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                let defPayImg = new Buffer('PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTIwcHgiIGhlaWdodD0iMTIwcHgiIHZpZXdCb3g9IjAgMCAxMjAgMTIwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCA0Ni4yICg0NDQ5NikgLSBodHRwOi8vd3d3LmJvaGVtaWFuY29kaW5nLmNvbS9za2V0Y2ggLS0+CiAgICA8dGl0bGU+QXJ0Ym9hcmQgQ29weTwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxkZWZzPgogICAgICAgIDxyZWN0IGlkPSJwYXRoLTEiIHg9IjAiIHk9IjAiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCI+PC9yZWN0PgogICAgICAgIDxyZWN0IGlkPSJwYXRoLTIiIHg9IjAiIHk9IjAiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCI+PC9yZWN0PgogICAgICAgIDxyZWN0IGlkPSJwYXRoLTMiIHg9IjAiIHk9IjAiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCI+PC9yZWN0PgogICAgICAgIDxyZWN0IGlkPSJwYXRoLTQiIHg9IjAiIHk9IjAiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCI+PC9yZWN0PgogICAgPC9kZWZzPgogICAgPGcgaWQ9IlBhZ2UtMSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IkFydGJvYXJkLUNvcHkiPgogICAgICAgICAgICA8ZyBpZD0iR3JvdXAiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE3LjAwMDAwMCwgMTcuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8ZyBpZD0iUmVjdGFuZ2xlIj4KICAgICAgICAgICAgICAgICAgICA8dXNlIGZpbGw9IiNGRkZGRkYiIGZpbGwtcnVsZT0iZXZlbm9kZCIgeGxpbms6aHJlZj0iI3BhdGgtMSI+PC91c2U+CiAgICAgICAgICAgICAgICAgICAgPHJlY3Qgc3Ryb2tlPSIjOTc5Nzk3IiBzdHJva2Utd2lkdGg9IjIiIHg9IjEiIHk9IjEiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PC9yZWN0PgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPHJlY3QgaWQ9IlJlY3RhbmdsZS0yIiBmaWxsPSIjOTc5Nzk3IiB4PSI0IiB5PSI0IiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiPjwvcmVjdD4KICAgICAgICAgICAgPC9nPgogICAgICAgICAgICA8ZyBpZD0iR3JvdXAtQ29weSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODUuMDAwMDAwLCAxNy4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxnIGlkPSJSZWN0YW5nbGUiPgogICAgICAgICAgICAgICAgICAgIDx1c2UgZmlsbD0iI0ZGRkZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiB4bGluazpocmVmPSIjcGF0aC0yIj48L3VzZT4KICAgICAgICAgICAgICAgICAgICA8cmVjdCBzdHJva2U9IiM5Nzk3OTciIHN0cm9rZS13aWR0aD0iMiIgeD0iMSIgeT0iMSIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ij48L3JlY3Q+CiAgICAgICAgICAgICAgICA8L2c+CiAgICAgICAgICAgICAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlLTIiIGZpbGw9IiM5Nzk3OTciIHg9IjQiIHk9IjQiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PC9yZWN0PgogICAgICAgICAgICA8L2c+CiAgICAgICAgICAgIDxnIGlkPSJHcm91cC1Db3B5LTIiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDg1LjAwMDAwMCwgODUuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8ZyBpZD0iUmVjdGFuZ2xlIj4KICAgICAgICAgICAgICAgICAgICA8dXNlIGZpbGw9IiNGRkZGRkYiIGZpbGwtcnVsZT0iZXZlbm9kZCIgeGxpbms6aHJlZj0iI3BhdGgtMyI+PC91c2U+CiAgICAgICAgICAgICAgICAgICAgPHJlY3Qgc3Ryb2tlPSIjOTc5Nzk3IiBzdHJva2Utd2lkdGg9IjIiIHg9IjEiIHk9IjEiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PC9yZWN0PgogICAgICAgICAgICAgICAgPC9nPgogICAgICAgICAgICAgICAgPHJlY3QgaWQ9IlJlY3RhbmdsZS0yIiBmaWxsPSIjOTc5Nzk3IiB4PSI0IiB5PSI0IiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiPjwvcmVjdD4KICAgICAgICAgICAgPC9nPgogICAgICAgICAgICA8ZyBpZD0iR3JvdXAtQ29weS0zIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxOS4wMDAwMDAsIDg1LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPGcgaWQ9IlJlY3RhbmdsZSI+CiAgICAgICAgICAgICAgICAgICAgPHVzZSBmaWxsPSIjRkZGRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHhsaW5rOmhyZWY9IiNwYXRoLTQiPjwvdXNlPgogICAgICAgICAgICAgICAgICAgIDxyZWN0IHN0cm9rZT0iIzk3OTc5NyIgc3Ryb2tlLXdpZHRoPSIyIiB4PSIxIiB5PSIxIiB3aWR0aD0iMTYiIGhlaWdodD0iMTYiPjwvcmVjdD4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDxyZWN0IGlkPSJSZWN0YW5nbGUtMiIgZmlsbD0iIzk3OTc5NyIgeD0iNCIgeT0iNCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIj48L3JlY3Q+CiAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPHRleHQgaWQ9IuS6jOe7tOeggSIgZm9udC1mYW1pbHk9IlBpbmdGYW5nU0MtTWVkaXVtLCBQaW5nRmFuZyBTQyIgZm9udC1zaXplPSIxOCIgZm9udC13ZWlnaHQ9IjQwMCIgZmlsbD0iIzk3OTc5NyI+CiAgICAgICAgICAgICAgICA8dHNwYW4geD0iMzUiIHk9IjY1Ij7kuoznu7TnoIE8L3RzcGFuPgogICAgICAgICAgICA8L3RleHQ+CiAgICAgICAgICAgIDxyZWN0IGlkPSJSZWN0YW5nbGUtNSIgZmlsbD0iIzk3OTc5NyIgeD0iMyIgeT0iMyIgd2lkdGg9IjQiIGhlaWdodD0iMzIiPjwvcmVjdD4KICAgICAgICAgICAgPHJlY3QgaWQ9IlJlY3RhbmdsZS01LUNvcHktMiIgZmlsbD0iIzk3OTc5NyIgeD0iMTEzIiB5PSIzIiB3aWR0aD0iNCIgaGVpZ2h0PSIzMiI+PC9yZWN0PgogICAgICAgICAgICA8cmVjdCBpZD0iUmVjdGFuZ2xlLTUtQ29weSIgZmlsbD0iIzk3OTc5NyIgeD0iMyIgeT0iODUiIHdpZHRoPSI0IiBoZWlnaHQ9IjMyIj48L3JlY3Q+CiAgICAgICAgICAgIDxyZWN0IGlkPSJSZWN0YW5nbGUtNS1Db3B5LTMiIGZpbGw9IiM5Nzk3OTciIHg9IjExMyIgeT0iODUiIHdpZHRoPSI0IiBoZWlnaHQ9IjMyIj48L3JlY3Q+CiAgICAgICAgICAgIDxyZWN0IGlkPSJSZWN0YW5nbGUtNiIgZmlsbD0iIzk3OTc5NyIgeD0iMyIgeT0iMyIgd2lkdGg9IjMyIiBoZWlnaHQ9IjQiPjwvcmVjdD4KICAgICAgICAgICAgPHJlY3QgaWQ9IlJlY3RhbmdsZS02LUNvcHkiIGZpbGw9IiM5Nzk3OTciIHg9IjMiIHk9IjExMyIgd2lkdGg9IjMyIiBoZWlnaHQ9IjQiPjwvcmVjdD4KICAgICAgICAgICAgPHJlY3QgaWQ9IlJlY3RhbmdsZS02LUNvcHktMiIgZmlsbD0iIzk3OTc5NyIgeD0iODUiIHk9IjExMyIgd2lkdGg9IjMyIiBoZWlnaHQ9IjQiPjwvcmVjdD4KICAgICAgICAgICAgPHJlY3QgaWQ9IlJlY3RhbmdsZS02LUNvcHktMyIgZmlsbD0iIzk3OTc5NyIgeD0iODUiIHk9IjMiIHdpZHRoPSIzMiIgaGVpZ2h0PSI0Ij48L3JlY3Q+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=', 'base64');
                if(res&&res[0]&&res[0].pay_type){
                    let flag = false;
                    let path = config["user"]+"pay/"+res[0].pay_type +"/";
                    
                    fs.readdir(path, function (err, files) {
                        if(files){
                            files.forEach(function (itm, index) {
                                const filedId = itm.split(".")[0];
                                if(filedId==request.query.id){
                                    path = path+itm;
                                    flag =true;
                                    // reply({'status':'ok','imgPath':itm,'type':res[0].pay_type});
                                }
                            })
                        }
                        if(flag){
                            fs.readFile(path, function (err, data) {
                                const decodeImg = new Buffer(data.toString("base64"), 'base64');
                                cache.put("pay"+request.query.id, decodeImg);
                                reply(decodeImg).type('image/png');
                            }); 
                        }else {
                            cache.put("pay"+request.query.id, defPayImg);
                            reply(defPayImg).type('image/png');
                        }
                    });
                }else{
                    cache.put("pay"+request.query.id, defPayImg);
                    reply(defPayImg).type('image/png');
                }
            }

        });

        }
    },
    config: {
        description: '根据ID获得支付二维码',
        validate: {
            query: {
                id: Joi.number().required(),
                r: Joi.optional()
            }
        }
    }
};
