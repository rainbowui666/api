const Base = require('./base.js');
const QcloudSms = require('qcloudsms_js');
const rp = require('request-promise');

module.exports = class extends Base {
  async validateVerificationAction() {
    const requestId = this.post('requestId');
    const code = this.post('code');
    const userId = this.post('userId');
    const phone = this.post('phone');
    const auth = await this.cache(requestId);
    if (think.isEmpty(code)) {
      this.fail('验证码失效');
    } else if (code !== auth) {
      this.fail('验证码不正确');
    } else {
      if (userId) {
        await this.model('user').where({'id': userId}).update({'phone': phone});
      }
      this.success(true);
    }
  }
  async sendVerificationAction() {
    const accessKeyId = think.config('weixin.accessKeyId');
    const secretAccessKey = think.config('weixin.secretAccessKey');
    const qcloudsms = QcloudSms(accessKeyId, secretAccessKey);
    const code = parseInt(Math.random() * 9000 + 1000) + '';
    const ssender = qcloudsms.SmsSingleSender();
    const params = [code];
    return new Promise((resolve, reject) => {
      ssender.sendWithParam(86, this.post('phone'), 140767, params, '', '', '', (err, res, resData) => {
        if (err) {
          reject(this.fail('发送失败'));
        } else {
          this.cache(resData.sid, code, {
            timeout: 5 * 60 * 1000
          });
          resolve(this.json({'requestId': resData.sid}));
        }
      });
    });
  }
  async getCityByPhoneAction(phone) {
    const _phone = phone || this.post('phone');
    const options = {
      method: 'GET',
      url: 'http://apis.juhe.cn/mobile/get',
      qs: {
        phone: _phone,
        key: this.config('jhsj.phone_key')
      }
    };
    const phoneDate = await rp(options);
    let tempCity = null;
    if (phoneDate && JSON.parse(phoneDate).resultcode === '200') {
      tempCity = JSON.parse(phoneDate).result;
    } else {
      tempCity = {
        'province': '上海',
        'city': '上海'
      };
    }
    const returnCity = await this.model('citys').where({'name': tempCity.city, 'type': 2}).find();
    if (!think.isEmpty(returnCity)) {
      tempCity.mark = returnCity.mark;
      tempCity.area = returnCity.area;
    }
    this.json(tempCity);
    return tempCity;
  }
};
