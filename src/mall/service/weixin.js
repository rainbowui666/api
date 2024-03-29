const crypto = require('crypto');
const md5 = require('md5');
const rp = require('request-promise');

module.exports = class extends think.Service {
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

    if (decoded.watermark.appid !== think.config('weixin.appid')) {
      return '';
    }

    return decoded;
  }

  async createMeituanUnifiedOrder(payInfo) {
    // 'merchantId': 193802965,测试
    const param = {
      'appId': 31291,
      'body': payInfo.body,
      'channel': 'wx_scan_pay',
      'merchantId': 193806838,
      'notifyUrl': think.config('weixin.mei_notify_url'),
      'openId': payInfo.openid,
      'outTradeNo': payInfo.out_trade_no,
      'random': 'jyhs' + Date.now(),
      'subject': '礁岩海水订单',
      'totalFee': payInfo.total_fee,
      'tradeType': 'JSAPI',
      'wxSubAppId': 'wx9f635f06da7360d7'
    };
    const paramStr = `appId=${param.appId}&body=${param.body}&channel=${param.channel}&merchantId=${param.merchantId}&notifyUrl=${param.notifyUrl}&openId=${param.openId}&outTradeNo=${param.outTradeNo}&random=${param.random}&subject=${param.subject}&totalFee=${param.totalFee}&tradeType=${param.tradeType}&key=b055410a3e5e4ca18f03c75963be37f4`;
    param.sign = crypto.createHash('SHA256').update(paramStr).digest('hex');
    const options = {
      method: 'POST',
      url: 'https://openpay.meituan.com/api/precreate',
      body: param,
      json: true
    };
    const sessionData = await rp(options);
    const perpayId = sessionData.prepayId;
    sessionData['package'] = 'prepay_id=' + perpayId;
    return sessionData;
  }

  createUnifiedOrder(payInfo) {
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
