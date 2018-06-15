const util  = require("../../lib/util");
var QcloudSms = require("qcloudsms_js");
const Joi = require('joi');
const Boom = require('boom');
const config = require('../../config.js');

module.exports = {
    path: '/api/tools/send/verification',
    method: 'POST',
    handler(request, reply) {
        const accessKeyId = '1400101084';
        const secretAccessKey = '7c1e62752a6cd88719ef61cbf3b93ccb';
        var qcloudsms = QcloudSms(accessKeyId, secretAccessKey);
        const code = parseInt(Math.random()*9000+1000);

        var ssender = qcloudsms.SmsSingleSender();
        var params = [code+""];
        ssender.sendWithParam(86, request.payload.phone, 140767,
        params, "", "", "", (err, res, resData) => {
            if (err){
                console.log("err: ", err);
                reply(Boom.notAcceptable('验证码发送失败'));
            }else
                //console.log("response data: ", resData);
                global.globalCahce.set(resData.sid, code);
                reply({"status":"ok","requestId":resData.sid});
        });

        
        //发送短信
        // smsClient.sendSMS({
        //     PhoneNumbers: request.payload.phone,
        //     SignName: '礁岩海水',
        //     TemplateCode: 'SMS_119090261',
        //     TemplateParam: '{"code":"'+code+'"}'
        // }).then(function (res) {
        //     let {Code}=res
        //     if (Code === 'OK') {
        //         // { Message: 'OK',
        //         // RequestId: '49369B45-0F07-4328-8892-029717A54D69',
        //         // BizId: '340003414040389327^0',
        //         // Code: 'OK' }
        //         global.globalCahce.set(res.RequestId, code);
        //         reply({"status":"ok","requestId":res.RequestId});
        //     }
        // }, function (err) {
        //     console.log(err);
        //     reply(Boom.notAcceptable('验证码发送失败'));
        // })
    },
    config: {
        description: '发送手机验证码',
        validate: {
            payload: {
                phone: Joi.string().required().min(3).max(11)
            }
        }
    }
};
