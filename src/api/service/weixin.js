const crypto = require('crypto');
const md5 = require('md5');
const qs = require('querystring');
const https = require('https');
const _ = require('lodash');
const rp = require('request-promise');
module.exports = class extends think.Service {
  async getToken() {
    const options = {
      method: 'GET',
      url: 'https://api.weixin.qq.com/cgi-bin/token',
      qs: {
        grant_type: 'client_credential',
        secret: think.config('weixin.public_secret'),
        appid: think.config('weixin.public_appid')
      }
    };

    const sessionData = await rp(options);
    return JSON.parse(sessionData);
  }
  async sendSubscribeMessage() {
    const token = await this.service('weixin').getToken();
    const options = {
      method: 'POST',
      url: 'https://api.weixin.qq.com/cgi-bin/message/template/subscribe?access_token=' + _.values(token)[0],
      body: {
        touser: this.post('openId'),
        template_id: 'MBKFHUw6G4vVktlxqxu4BGRzH8u9xSBRaMDL0dUBJfU',
        miniprogram: {
          'appid': 'wx9f635f06da7360d7',
          'pagepath': 'pages/index/index?type=group&id=1597'
        },
        scene: 1000,
        title: '测试title',
        data: {
          content: {
            value: '测试value',
            color: '#ff0000'
          }
        }
      },
      json: true
    };
    rp(options);
  }

  async sendOpenGroupMessage(token, user, group) {
    let description = '这个团长很懒什么描述都没有';
    if (!think.isEmpty(group.description)) {
      description = group.description.replace(/<[^>]+>/g, '');
    }
    const options = {
      method: 'POST',
      url: 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + token,
      body: {
        touser: user['openid'],
        template_id: 'KuLyRiWNY-DTCKWdUzXQkkG5LOxTP-rNQ3Xjle-xDgg',
        miniprogram: {
          'appid': 'wx9f635f06da7360d7',
          'pagepath': 'pages/index/index?type=group&id=' + group.id
        },
        data: {
          'first': {'value': `礁岩海水 团长: ${group.contacts} 在 ${group.city_name} 开团了.`, 'color': '#2d8cf0'},
          'keyword1': {'value': group.name, 'color': '#17233d'},
          'keyword2': {'value': group.end_date, 'color': '#17233d'},
          'remark': {'value': description, 'color': '#ff9900'}
        }
      },
      json: true
    };
    rp(options);
  }
  async sendAddBillMessage(token, user, bill) {
    let description = '礁岩海水最新渔场出货单';
    if (!think.isEmpty(bill.description)) {
      description = bill.description.replace(/<[^>]+>/g, '');
    }
    const options = {
      method: 'POST',
      url: 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + token,
      body: {
        touser: user['openid'],
        template_id: 'WD1NaoO9bncFhmVKDq49O_t6qc09mp-iEB1x_eS33aY',
        miniprogram: {
          'appid': 'wx9f635f06da7360d7',
          'pagepath': 'pages/index/index?type=bill-detail&id=' + bill.id
        },
        data: {
          'first': {'value': `礁岩海水 管理员: ${bill.contacts} 上传了最新的单子.`, 'color': '#17233d'},
          'keyword1': {'value': bill.name, 'color': '#2d8cf0'},
          'keyword2': {'value': 'CORAL-' + bill.id, 'color': '#17233d'},
          'remark': {'value': description, 'color': '#ff9900'}
        }
      },
      json: true
    };
    rp(options);
  }
  async sendFinishGroupMessage(token, user, group) {
    let description = '这个团长很懒什么描述都没有';
    if (!think.isEmpty(group.description)) {
      description = group.description.replace(/<[^>]+>/g, '');
    }
    const options = {
      method: 'POST',
      url: 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + token,
      body: {
        touser: user['openid'],
        template_id: 'KLrD5MRG69-AUKWjf8_L8qo6cDTizo2-2o4j-DQ-QIU',
        miniprogram: {
          'appid': 'wx9f635f06da7360d7',
          'pagepath': 'pages/index/index?type=group&id=' + group.id
        },
        data: {
          'first': {'value': `恭喜您，您参加的团购已结束，团长会尽快发货。`, 'color': '#17233d'},
          'Pingou_ProductName': {'value': group.name, 'color': '#2d8cf0'},
          'Weixin_ID': {'value': group.contacts, 'color': '#17233d'},
          'remark': {'value': description, 'color': '#ff9900'}
        }
      },
      json: true
    };
    rp(options);
  }

  async sendOrderMessage(user, group, cart) {
    const token = await this.service('weixin').getToken();
    const options = {
      method: 'POST',
      url: 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + _.values(token)[0],
      body: {
        touser: user['open_id'],
        template_id: 'KuLyRiWNY-DTCKWdUzXQkkG5LOxTP-rNQ3Xjle-xDgg',
        miniprogram: {
          'appid': 'wx9f635f06da7360d7',
          'pagepath': 'pages/index/index?type=group&id=1597'
        },
        topcolor: '#FF0000',
        data: {'first': {'value': '礁岩海水 CEO 开团了', 'color': '#173177'}, 'keyword1': {'value': 'york 姚远 开团了', 'color': '#173177'}, 'keyword2': {'value': '2018-11-08', 'color': '#173177'}, 'remark': {'value': 'tony 太牛逼了', 'color': '#173177'}}
      },
      json: true
    };
    rp(options);
  }
  /**
   * 根据code获得用户信息
   * @param code
   * @returns {Promise.<string>}
   */
  async getUserInfoByCode(code) {
    const queryDate = {
      appid: think.config('weixin.mini_appid'),
      secret: think.config('weixin.mini_secret'),
      code: code,
      grant_type: 'authorization_code'
    };
    const content = qs.stringify(queryDate);
    const options = {
      hostname: 'api.weixin.qq.com',
      port: 443,
      path: '/sns/oauth2/access_token?' + content,
      method: 'GET',
      json: true,
      rejectUnauthorized: true
    };
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        res.setEncoding('utf8');
        res.on('data', async(userChunk) => {
          const userObject = JSON.parse(userChunk);
          if (!_.isEmpty(userObject.unionid)) {
            const user = await this.model('user').where({unionid: userObject.unionid}).find();
            if (!_.isEmpty(user)) {
              resolve(user);
            } else {
              resolve({});
            }
          } else {
            resolve({});
          }
        });
      });

      req.on('error', (e) => {
        reject(e.message);
      });

      req.end();
    });
  }
  /**
   * 解析微信登录用户数据
   * @param sessionKey
   * @param encryptedData
   * @param iv
   * @returns {Promise.<string>}
   */
  async decryptUserInfoData(sessionKey, encryptedData, iv) {
    // base64 decode
    const _sessionKey = Buffer.from(sessionKey, 'base64');
    encryptedData = Buffer.from(encryptedData, 'base64');
    iv = Buffer.from(iv, 'base64');
    let decoded = '';
    try {
      // 解密
      const decipher = crypto.createDecipheriv('aes-128-cbc', _sessionKey, iv);
      // 设置自动 padding 为 true，删除填充补位
      decipher.setAutoPadding(true);
      decoded = decipher.update(encryptedData, 'binary', 'utf8');
      decoded += decipher.final('utf8');

      decoded = JSON.parse(decoded);
    } catch (err) {
      return '';
    }

    if (decoded.watermark.appid !== think.config('weixin.mini_appid')) {
      return '';
    }

    return decoded;
  }

  async createUnifiedOrder(payInfo) {
    const orderNo = payInfo.orderNo;
    const appId = think.config('weixin.public_appid');
    const attach = `${payInfo.userId}-${payInfo.cartId}`;
    const mchId = think.config('weixin.mch_id');
    const nonceStr = Math.random().toString(36).substr(2, 15);
    const totalFee = payInfo.totalFee;
    const notifyUrl = 'https://api2.huanjiaohu.com/notice/handleWxNotify';
    const openid = payInfo.openid;
    const ip = payInfo.ip;
    const body = payInfo.body;
    const timeStamp = parseInt(new Date().getTime() / 1000) + '';
    const sign = this.paysignjsapi(appId, attach, body, mchId, nonceStr, notifyUrl, openid, orderNo, ip, totalFee, 'JSAPI');
    const url = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
    let formData = '<xml>';
    formData += '<appid>' + appId + '</appid>'; // appid
    formData += '<attach>' + attach + '</attach>'; // 附加数据
    formData += '<body>' + body + '</body>';
    formData += '<mch_id>' + mchId + '</mch_id>'; // 商户号
    formData += '<nonce_str>' + nonceStr + '</nonce_str>'; // 随机字符串，不长于32位。
    formData += '<notify_url>' + notifyUrl + '</notify_url>';
    formData += '<openid>' + openid + '</openid>';
    formData += '<out_trade_no>' + orderNo + '</out_trade_no>';
    formData += '<spbill_create_ip>' + ip + '</spbill_create_ip>';
    formData += '<total_fee>' + totalFee + '</total_fee>';
    formData += '<trade_type>JSAPI</trade_type>';
    formData += '<sign>' + sign + '</sign>';
    formData += '</xml>';
    const options = {
      method: 'POST',
      url: url,
      body: formData,
      json: true
    };
    const orderResult = await rp(options);
    const _error = this.getXMLNodeValue('err_code_des', orderResult);
    if (_error) {
      const tmp = _error.split('[');
      const tmp1 = tmp[2].split(']');
      return {error: tmp1[0]};
    } else {
      const _prepayId = this.getXMLNodeValue('prepay_id', orderResult);
      if (_prepayId) {
        const tmp = _prepayId.split('[');
        const tmp1 = tmp[2].split(']');
        const prepayId = 'prepay_id=' + tmp1[0];
        const paySignjs = this.paysignjs(appId, nonceStr, prepayId, 'MD5', timeStamp);
        return {
          'appId': appId, // 公众号名称，由商户传入
          'timeStamp': timeStamp, // 时间戳，自1970年以来的秒数
          'nonceStr': nonceStr, // 随机串
          'package': prepayId,
          'signType': 'MD5', // 微信签名方式：
          'paySign': paySignjs // 微信签名
        };
      } else {
        return {error: orderResult};
      }
    }
  }

  paysignjs(appid, nonceStr, prepayId, signType, timeStamp) {
    var ret = {
      appId: appid,
      nonceStr: nonceStr,
      package: prepayId,
      signType: signType,
      timeStamp: timeStamp
    };
    var string = this.raw(ret);
    var key = think.config('weixin.partner_key');
    string = string + '&key=' + key;
    var crypto = require('crypto');
    return crypto.createHash('md5').update(string, 'utf8').digest('hex');
  };

  getXMLNodeValue(nodeName, xml) {
    var tmp = xml.split('<' + nodeName + '>');
    var _tmp = tmp[1] ? tmp[1].split('</' + nodeName + '>') : [];
    return _tmp[0];
  }

  paysignjsapi(appId, attach, body, mchId, nonceStr, notifyUrl, openid, orderNo, ip, totalFee, tradeType) {
    var ret = {
      appid: appId,
      attach: attach,
      body: body,
      mch_id: mchId,
      nonce_str: nonceStr,
      notify_url: notifyUrl,
      openid: openid,
      out_trade_no: orderNo,
      spbill_create_ip: ip,
      total_fee: totalFee,
      trade_type: tradeType
    };
    var string = this.raw(ret);
    var key = think.config('weixin.partner_key');
    string = string + '&key=' + key;
    var crypto = require('crypto');
    return crypto.createHash('md5').update(string, 'utf8').digest('hex');
  };

  raw(args) {
    var keys = Object.keys(args);
    keys = keys.sort();
    var newArgs = {};
    keys.forEach(function(key) {
      newArgs[key] = args[key];
    });
    var string = '';
    for (var k in newArgs) {
      string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
  };

  createUnifiedOrderForMinProgram(payInfo) {
    const WeiXinPay = require('weixinpay');
    const weixinpay = new WeiXinPay({
      appid: think.config('weixin.mini_appid'), // 微信小程序appid
      openid: payInfo.openid, // 用户openid
      mch_id: think.config('weixin.mch_id'), // 商户帐号ID
      partner_key: think.config('weixin.partner_key') // 秘钥
    });
    return new Promise((resolve, reject) => {
      weixinpay.createUnifiedOrder({
        body: payInfo.body,
        out_trade_no: payInfo.out_trade_no,
        total_fee: payInfo.total_fee,
        spbill_create_ip: payInfo.spbill_create_ip,
        notify_url: think.config('weixin.notify_url'),
        trade_type: 'JSAPI'
      }, (res) => {
        if (res.return_code === 'SUCCESS' && res.result_code === 'SUCCESS') {
          const returnParams = {
            'appid': res.appid,
            'timeStamp': parseInt(Date.now() / 1000) + '',
            'nonceStr': res.nonce_str,
            'package': 'prepay_id=' + res.prepay_id,
            'signType': 'MD5'
          };
          const paramStr = `appId=${returnParams.appid}&nonceStr=${returnParams.nonceStr}&package=${returnParams.package}&signType=${returnParams.signType}&timeStamp=${returnParams.timeStamp}&key=` + think.config('weixin.partner_key');
          returnParams.paySign = md5(paramStr).toUpperCase();
          resolve(returnParams);
        } else {
          reject(res);
        }
      });
    });
  }

  /**
   * 生成排序后的支付参数 query
   * @param queryObj
   * @returns {Promise.<string>}
   */
  buildQuery(queryObj) {
    const sortPayOptions = {};
    for (const key of Object.keys(queryObj).sort()) {
      sortPayOptions[key] = queryObj[key];
    }
    let payOptionQuery = '';
    for (const key of Object.keys(sortPayOptions).sort()) {
      payOptionQuery += key + '=' + sortPayOptions[key] + '&';
    }
    payOptionQuery = payOptionQuery.substring(0, payOptionQuery.length - 1);
    return payOptionQuery;
  }

  /**
   * 对 query 进行签名
   * @param queryStr
   * @returns {Promise.<string>}
   */
  signQuery(queryStr) {
    queryStr = queryStr + '&key=' + think.config('weixin.partner_key');
    const md5 = require('md5');
    const md5Sign = md5(queryStr);
    return md5Sign.toUpperCase();
  }

  /**
   * 处理微信支付回调
   * @param notifyData
   * @returns {{}}
   */
  payNotify(notifyData) {
    if (think.isEmpty(notifyData)) {
      return false;
    }

    const notifyObj = {};
    let sign = '';
    for (const key of Object.keys(notifyData)) {
      if (key !== 'sign') {
        notifyObj[key] = notifyData[key][0];
      } else {
        sign = notifyData[key][0];
      }
    }
    if (notifyObj.return_code !== 'SUCCESS' || notifyObj.result_code !== 'SUCCESS') {
      return false;
    }
    const signString = this.signQuery(this.buildQuery(notifyObj));
    if (think.isEmpty(sign) || signString !== sign) {
      return false;
    }
    return notifyObj;
  }
};
