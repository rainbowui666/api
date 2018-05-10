const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');
const fs = require("fs");
// const image2base64 = require('image-to-base64');

module.exports = {
    path: '/api/material/image/base64/small',
    method: 'GET',
    handler(request, reply) {
        const select = `select category,code  from material where id=${request.query.id}`;
        request.app.db.query(select, (err, res) => {
            if(err) {
                request.log(['error'], err);
                reply(Boom.serverUnavailable(config.errorMessage));
            } else {
                if(res&&res[0]&&res[0].category){
                    const filePath = config.image + "/"+res[0].category+"/";
                    const results = [];
                    fs.readdir(filePath,function(err,files){
                        if(err){
                            console.log(err);
                            return;
                        }
                        files.forEach(function(filename){
                            const temp = filename.substring(0,filename.indexOf(".")).split("-");
                            if(res[0].code == temp[1]){
                                const small_path = config["image"] + "/small"+`/${res[0].category}/${filename}`;
                                try {
                                    const imageBuf = fs.readFileSync(small_path);
                                    const decodeImg = new Buffer(imageBuf.toString("base64"), 'base64');
                                    reply(decodeImg).type('image/png');
                                } catch (error) {
                                    reply(new Buffer('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xCKA6A6AbUUAVkUAmgEAcQEAiQGAurqqn3+GPMvVZdyL2gqArxgbe5MCQLQF+NI3NjbaOjb2pQ4AuwfQ8W58TwcA0DoAsHuxc3xw9BWDC0XwL/EPItAH0e5jnfEAAAAJcEhZcwAACxMAAAsTAQCanBgAAAUMaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0MCA3OS4xNjA0NTEsIDIwMTcvMDUvMDYtMDE6MDg6MjEgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTgtMDUtMDVUMjE6MDM6MzIrMDg6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMTgtMDUtMDVUMjE6MDM6MzIrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE4LTA1LTA1VDIxOjAzOjMyKzA4OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1NjRkZDNiMy00YmY0LTRhYjEtYTI5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', 'base64')).type('image/png');
                                }
                             
                            }
                        });
                    });
                }else{
                    reply(new Buffer('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xCKA6A6AbUUAVkUAmgEAcQEAiQGAurqqn3+GPMvVZdyL2gqArxgbe5MCQLQF+NI3NjbaOjb2pQ4AuwfQ8W58TwcA0DoAsHuxc3xw9BWDC0XwL/EPItAH0e5jnfEAAAAJcEhZcwAACxMAAAsTAQCanBgAAAUMaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0MCA3OS4xNjA0NTEsIDIwMTcvMDUvMDYtMDE6MDg6MjEgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTgtMDUtMDVUMjE6MDM6MzIrMDg6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMTgtMDUtMDVUMjE6MDM6MzIrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE4LTA1LTA1VDIxOjAzOjMyKzA4OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1NjRkZDNiMy00YmY0LTRhYjEtYTI5ZS1kNjkzNjA3ZTQyNWIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NTY0ZGQzYjMtNGJmNC00YWIxLWEyOWUtZDY5MzYwN2U0MjViIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NTY0ZGQzYjMtNGJmNC00YWIxLWEyOWUtZDY5MzYwN2U0MjViIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0iRGlzcGxheSI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NTY0ZGQzYjMtNGJmNC00YWIxLWEyOWUtZDY5MzYwN2U0MjViIiBzdEV2dDp3aGVuPSIyMDE4LTA1LTA1VDIxOjAzOjMyKzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgKE1hY2ludG9zaCkiLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+MaHLmwAAC5tJREFUeJzdm9tvG8UXx2fHe/Etvju+pIg0dZo0IdCKl+YBUAVIhaQlF3sTVP47ROL60koRbcUDIHFR+0JKJSgQmpCoeG3H9tpe2+v1Xn8PU/wzXttJHPv3a/N9y2Z3Z+bjc86cPTODaZoG/i1VVff391OpVC6XK5fLAAAMw8CrLDRGm83m9XoDgcD58+dxHG+7B2sD8dtvv21vb2ezWVVVzWaz2WzGsPZ7XjmhH5LneZ7nAQBer/fKlStzc3P/uqc5SFmW79+///TpU6vVarVaz8D4OwrDsFqtVi6XQ6HQjRs3jEbji+totIqiJBKJg4OD0dHRs4qgVRiGHR4e+v1+mqYpigIAQPSPra2tg4MDv98P/vGosy1N03w+XzabvXv3LrqCAwAeP368s7Pj8/lUVW29WxRFWZZf9UiJpGkajuMkSTbtXVVVr9e7v7//8OHD+fl5XFGUX375pTUoQAgbjUalUnG5XC6Xq43OKyoIIc/zhULBYrEYjUY0KE3THA7H06dPL1++jO/u7uZyOZfLhShgGCYIgqIo165de+ONNwiCOBuegmGYoii///77Dz/8wPO8yWRC4zKZTLlcbmdnB2cYBt2H/qFpWr1e//DDD2dmZpqv+D8OYIAyGAyzs7Mmk+nevXsURaFxIZdJp9OQZVmj0dj82XmeDwaDTQpnTxMTE6+//nqtVmteMZvNpVIJlstls9ncvCpJksPhGHjziqIoijLw1/Ynp9Mpy3LzT4qi6vU6Dlr8AglCOMBWnz179uuvv3Ich2GYzWZ78803x8fHB/j+PtQ2QDR2fKjp048//vj9999TFGUymQAAh4eHf/zxxzvvvHP16tUhtXgc6ceLYVj7t8cAtb29/d13342OjuI43gzRkiR9/fXXFEVduXJleE33oUF6QasEQfjpp5/sdnuTAgBA0zSCIBwOx5MnT16ekIE0LBCZTIbnebPZ3GaHmqaZzeZqtZrNZofUdH8aFghJkrqFHpTbiKI4pKb707BAWK1Wg8HQMT1XFIUkyZGRkSE13Z+GFSwDgYDX62UYxuPxtOKAEBYKhfHxcbfbfaIXiqLIMEy5XJZlmaIol8vl9/sHONMPcdb44IMPNjY2WJZ1Op3NDxmWZQmCePfdd4//HhR3d3Z2OI5TFEXTNAghjuMul2t2dvatt94ayEfAEEF4PB6aph88eJDL5SCEmqapqur3+69fv+71eo/5EpZl79y5k8/nHQ6H3W5vXtc0rVQqPXjwYHd39+bNmwRBnLK3QwQBAPD7/bdu3drb2ysUCgAAj8czMTFx/E6zLBuLxQRBCAaDbeEGwzCLxWK1Wvf29hKJxOrqKkmSp+nqcEEAAEiSnJ6e7uPBbDabSCRUVe1RE0GFJoZhotEoTdPNAmQfGtascUrlcrl4PK6qqt1u710ZQoUmdL8kSX23+DKCyOfzyWRS07Q2ChBCURRLpZKqqq0BsskiFos1Go3+Gn3pQGQymc3NTUmS9BSq1SpBEHNzc4IgNBqN1rlTVVWPx4OerdfrfbT7coE4PDyMx+MYhukpcBwny/L169fff//99957j+M4QRDaWHi9XpZl4/F4H2nrSwQim80mk0kAgM1m01PQNC0SiQQCAQDA7OzsRx99xHFcvV7X20WhULh9+/ZJ7eJlAZFOp2/fvi3LckdbAAA0KSAhFpVKRc/C7XbncrmTshjw9Mlx3O7ubrFYlGUZx3GPxzM5OYmqMj10eHiYSCQghHpbKJfLGIaFw2G0+NSq2dlZg8Hw5ZdfAgBMJlPzQWQX+Xw+Foutr6+jhawjNTAQ1Wr10aNHf/75Z61WMxgMEEJVVRVFefTo0dTU1NWrV7t1KJ1OJ5NJVMjT20I3CkjT09Oqqt6/fx90YlEoFKLRaCQSaS3KdtNgXCOdTn/++efb29sEQXi9XqfTabfbnU4nSqUfPnz4xRdflEol/YMMw8TjcU3TOtoCACASiXSjgDQzM7OwsFCr1Tr6CIoXaBG8twYAAoV6WZb9fn9rPQoAoGkaSZLBYJDjuM3NTZZlWx9E0RFCqI8L5XIZQhiJRHw+35EduHTp0sLCQsd44fF4isViPB4XBKH3S04LAv2k+sG0CqXJkiTF4/FisYguplKpWCzWOy4chwLS1NTUxx9/XKlUeJ7Xs2BZdnNzs7ddnApEKpVKJBJ6w9ZLVVWHw9FoNGKxmCiKxWIRxYWRkRE9BYPBQNP08SkgzczM3Lhxo16v61m43e5SqRSNRnvMI/2DQGvqHX/SRqORz+clSWrrkMPhkGV5Y2Pj7t27BEF0tAUIIU3To6OjfXRpampqYWGhWq12jBflcjkajQIAOsbOPkEwDBOLxUCn5KdUKplMpmvXrgEAOI5r69DIyAjabWCxWPQPorjg8Xj66xUA4OLFiwsLCxzHdbSLcrmcTCZZltXP6P1MnwzDdJv2S6USRVGLi4sul+vcuXOJRILjuNbbVFVFhQO9LZAkubq6evyaTTddunQJx/F79+4BAMxmc2vTLpcrm83m8/nWufZFH07aTCaTuXPnTjcKJEmura25XC4AgM/nW15eVhSlzS7a1BoXTk8BaXJyspuPmM1miqL0Ee1kIHp4RLFYJAgiEom0riEHg8HV1VVVVXuwEATB4XCEw2GEb1CanJxcXFysVqttPtJNJwDBMAya9rvFhbW1NX1t+ty5c+vr6xiGdWShaZogCJcvX+4vOvbW9PT08vJyo9Go1WpHsjguiB6JMPIImqa7/aSjo6PLy8uyLOtZYBhmNBp//vlnVNQcuCYmJlDeeaRdHAsEypo6UujoEXoFg8FIJKJpmp6F0WhEaUXHHPz0CoVCN2/e5Hm+t10cDQLZQjePMJvN6+vrx1mtGRsbo2la7yMovxAEIRqN5vP5I9/Thy5evLiysiKKYg8WR4BIpVIog+5IgSCIcDjsdDqP2SGfz7e0tCTLcqVS0bNoNBqtOfhgNT4+vri4WKvVurHoBSKdTqOZUp8IIwqRSOT4FJCQXeh9RFVVp9MpSVIikRiSj1y4cGFpaanRaFSrVT2LriAymUwikegWF0wm06efftpfChgMBsPhcEcWDoejXq9vbGzkcrk+3nykQqHQJ598guO4vqjZAYTVaq1UKt2iI7KFlZWV0+w58/v9PXxEkqRkMonqEQPX+fPnp6enq9Vq2/V2EBaLhWGYHrkjQRA0TZ90LVuv1157bW1trZuPiKIYi8WGFC8MBoP+YjsIkiRzuZwgCPq4gDzi1q1bp/koalUgEOjhIzzPR6NRVLkdrDruYIFtV9FHUVs2jmwBx/GVlRWbzTbAPiEfURRF7yNOp7NarX7zzTcDbA5Jv41A0zSoaVrv/QXIFkiSPGa+cFIhH9F/j6Di0l9//bW/vz/YFvUL6wAAaLPZetSwWueIYVBA8vv94XBYzwKVwvf29gbbHPrYbf4piqLRaIQul6ter3c0ClRQN5lMNE23btIYhgKBwOrqqtFobF3F1TSNoqjBphXPnz8/ODiwWCzNKzzP2+12GAgEum1/q9frTqfzyO+IQWlsbGx+fp7n+db+GAwGURQHdWZkd3f3q6++ghA2LQLDMEmSAoEAfuHCBbfb3XFPJITQaDQ+efKkVCoN+7ACKvxLkoSO0DSvIxvZ2tpCm4/6fj+EsFarZTIZiqKsVmtzu6sgCDabLRQK4SRJzszMfPvtt/qSJkVRxWKRYZj/zZENNGG1FtfAP2Hi77//PjKo9xY6l2G32yGETQpoNpyfnx8ZGXmxIz0ajT5//lx/rOsMC0KYz+fdbvdnn31mMBhehOilpSV06u3MnNfpLQhhLpez2+3hcBjFi/+eURAEYWtra29vz+FwNI88nT2hQ2vFYnFsbGxpaam5ARhrW6p8/PgxKpzhOG6xWCiKOjNEUGFGlmWn0zk3N/f222+3nhDvcGpFFMVnz56lUimWZVGu9ar7Cxqj0Wh0u92BQCAUCukXeP4D+8wPn7uO0oAAAAAASUVORK5CYII=', 'base64')).type('image/png');
                }
            }
        });
    },
    config: {
        description: '根据ID获得生物资料图片',
        validate: {
            query: {
                id: Joi.number().required()
            }
        }
    }
};
