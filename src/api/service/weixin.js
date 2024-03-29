const crypto = require('crypto');
const md5 = require('md5');
const qs = require('querystring');
const https = require('https');
const _ = require('lodash');
const rp = require('request-promise');
// const WXBizDataCrypt = require('../util/WXBizDataCrypt');

module.exports = class extends think.Service {
  async getMiniToken(appid, secret) {
    const token = await think.cache('miniappid' + appid);
    if (token) {
      return JSON.parse(token);
    } else {
      const options = {
        method: 'GET',
        url: 'https://api.weixin.qq.com/cgi-bin/token',
        qs: {
          grant_type: 'client_credential',
          secret: secret,
          appid: appid
        }
      };

      const sessionData = await rp(options);
      think.cache('miniappid' + appid, sessionData, {
        timeout: 60 * 60 * 2 * 1000
      });
      return JSON.parse(sessionData);
    }
  }
  async getToken(appid, secret) {
    const token = null;
    if (token) {
      return JSON.parse(token);
    } else {
      const options = {
        method: 'GET',
        url: 'https://api.weixin.qq.com/cgi-bin/token',
        qs: {
          grant_type: 'client_credential',
          secret: secret,
          appid: appid
        }
      };

      const sessionData = await rp(options);
      think.cache(appid, sessionData, {
        timeout: 60 * 60 * 2
      });
      return JSON.parse(sessionData);
    }
  }
  async getSessionKeyByCode(code) {
    const options = {
      method: 'GET',
      url: 'https://api.weixin.qq.com/sns/jscode2session',
      qs: {
        grant_type: 'authorization_code',
        secret: think.config('weixin.mini_secret'),
        appid: think.config('weixin.mini_appid'),
        js_code: code
      }
    };
    const sessionData = await rp(options);
    return JSON.parse(sessionData);
  }
  async getPublicUserListOpenid(token) {
    const options = {
      method: 'GET',
      url: 'https://api.weixin.qq.com/cgi-bin/user/get?access_token=' + token
    };
    const sessionData = await rp(options);
    return JSON.parse(sessionData);
  }
  async getUserInfoByPublicOpenid(token, openid) {
    const url = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + token + '&openid=' + openid + '&lang=zh_CN';
    const options = {
      method: 'GET',
      url: url
    };
    const sessionData = await rp(options);
    return JSON.parse(sessionData);
  }

  async sendOpenMallGroupMessage(token, message) {
    const options = {
      method: 'POST',
      url: 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + token,
      body: {
        touser: message.openid,
        template_id: '99XSqnQPeCFrmEetOMgMCFIHhKMXoPyCk4_oxNdX7yA',
        miniprogram: {
          'appid': 'wx9f635f06da7360d7',
          'pagepath': 'pages/mall/group/main?id=' + message.goodsId + '&group_id=' + message.groupId
        },
        data: {
          'first': {'value': '礁岩海水超性价比的拼团活动又又又开始了！', 'color': '#17233d'},
          'keyword1': {'value': message.title, 'color': '#2d8cf0'},
          'keyword2': {'value': `${message.price}元`, 'color': '#17233d'},
          'keyword3': {'value': '礁岩海水', 'color': '#17233d'},
          'keyword4': {'value': message.number, 'color': '#17233d'},
          'keyword5': {'value': message.endTime, 'color': '#17233d'},
          'remark': {'value': `${message.note}`, 'color': '#ff9900'}
        }
      },
      json: true
    };
    await rp(options);
  }

  async sendAdminReturnMessage(token, message) {
    const options = {
      method: 'POST',
      url: 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + token,
      body: {
        touser: message.openid,
        template_id: 'QIDPaomrFHFpx4gbyFsoaayYnp5Xy0FZhOGJl316kkY',
        miniprogram: {
          'appid': 'wx9f635f06da7360d7',
          'pagepath': 'pages/center/orderDetail/main?returnSubmit=yes&id=' + message.order_id
        },
        data: {
          'first': {'value': '有鱼友要退款了看看啥原因', 'color': '#2d8cf0'},
          'keyword1': {'value': message.order_sn, 'color': '#17233d'},
          'keyword2': {'value': `${message.account}元`, 'color': '#17233d'},
          'keyword3': {'value': message.address, 'color': '#17233d'},
          'keyword4': {'value': message.description, 'color': '#17233d'},
          'remark': {'value': `鱼友买了 ${message.goods_name} 这些东西要退款了`, 'color': '#ff9900'}
        }
      },
      json: true
    };
    await rp(options);
  }
  async sendAdminBuyMessage(token, message) {
    const options = {
      method: 'POST',
      url: 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + token,
      body: {
        touser: message.openid,
        template_id: '2lSDwdfQA6ojjII3Z_m2_maXk3jvmqfDRvGZzChDMZc',
        miniprogram: {
          'appid': 'wx9f635f06da7360d7',
          'pagepath': 'pages/center/orderDetail/main?returnSubmit=yes&id=' + message.order_id
        },
        data: {
          'first': {'value': '鱼友购买的商品已经支付成功，赶快发货吧', 'color': '#2d8cf0'},
          'keyword1': {'value': message.order_sn, 'color': '#17233d'},
          'keyword2': {'value': message.goods_name, 'color': '#17233d'},
          'keyword3': {'value': `${message.account}元`, 'color': '#ff9900'},
          'keyword4': {'value': '已支付', 'color': '#17233d'},
          'keyword5': {'value': message.pay_time, 'color': '#17233d'},
          'remark': {'value': `快递发往 ${message.address}, 如果有问题可以拨打鱼友电话${message.phone}`, 'color': '#ff9900'}
        }
      },
      json: true
    };
    await rp(options);
  }
  async sendExpressMessage(token, message) {
    const options = {
      method: 'POST',
      url: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + token,
      body: {
        touser: message.openid,
        template_id: 'BAMzPd6-kf1XO4bqEB4ZVYTG8qnxTqmGsVoxUlYowKU',
        page: 'pages/center/orderDetail/main?id=' + message.order_id,
        form_id: message.prepay_id,
        data: {
          'keyword1': {'value': message.order_sn},
          'keyword2': {'value': message.goods_name},
          'keyword3': {'value': message.shipper_name},
          'keyword4': {'value': message.logistic_code},
          'keyword5': {'value': message.address},
          'keyword6': {'value': message.phone},
          'keyword7': {'value': message.node}
        }
      },
      json: true
    };
    await rp(options);
  }
  async sendReturnSubmitMessage(token, message) {
    const options = {
      method: 'POST',
      url: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + token,
      body: {
        touser: message.openid,
        template_id: 'lvKWGiLDJTdz3n1GsbtUt8FY3nj2xVMRRkK3ee4XXug',
        page: 'pages/center/orderDetail/main?returnSubmit=yes&id=' + message.order_id,
        form_id: message.prepay_id,
        data: {
          'keyword1': {'value': message.order_sn},
          'keyword2': {'value': message.goods_name},
          'keyword3': {'value': message.account},
          'keyword4': {'value': message.address},
          'keyword5': {'value': message.description},
          'keyword6': {'value': message.phone}
        }
      },
      json: true
    };
    await rp(options);
  }

  async sendReturnMessage(token, message) {
    const options = {
      method: 'POST',
      url: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + token,
      body: {
        touser: message.openid,
        template_id: 'DLdCfno-5_qF1miAOJpA6xRw3ElzPvw-69ugxPtb5Bs',
        page: 'pages/center/account/main',
        form_id: message.prepay_id,
        data: {
          'keyword1': {'value': message.goods_name},
          'keyword2': {'value': message.account},
          'keyword3': {'value': '退款到 【我的】- 【我的余额】您可以在下次购买商品时使用'},
          'keyword4': {'value': message.phone}
        }
      },
      json: true
    };
    await rp(options);
  }

  async sendCancelMessage(token, message) {
    const options = {
      method: 'POST',
      url: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + token,
      body: {
        touser: message.openid,
        template_id: 'Z9Y3MaWj5co0in3lCzA6b7U0k8h0By7699rizwPnUjM',
        page: 'pages/center/order/main?status=101',
        form_id: message.prepay_id,
        data: {
          'keyword1': {'value': message.order_sn},
          'keyword2': {'value': message.goods_name},
          'keyword3': {'value': message.account},
          'keyword4': {'value': '真不好意思商品已售罄，欢迎您下次选购'}
        }
      },
      json: true
    };
    await rp(options);
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
        touser: user['public_openid'],
        template_id: 'KuLyRiWNY-DTCKWdUzXQkkG5LOxTP-rNQ3Xjle-xDgg',
        miniprogram: {
          'appid': 'wx9f635f06da7360d7',
          'pagepath': 'pages/index/index?type=group&id=' + group.id
        },
        data: {
          'first': {'value': `礁岩海水 团长: ${group.contacts} ${group.city_name} 开团了.`, 'color': '#2d8cf0'},
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
        touser: user['public_openid'],
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
        touser: user['public_openid'],
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
    const token = await this.service('weixin').getToken(think.config('weixin.public_appid'), think.config('weixin.public_secret'));
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
    sessionKey = Buffer.from(sessionKey, 'base64');
    encryptedData = Buffer.from(encryptedData, 'base64');
    iv = Buffer.from(iv, 'base64');
    // base64 decode

    try {
    // 解密
      var decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv);
      // 设置自动 padding 为 true，删除填充补位
      decipher.setAutoPadding(true);
      var decoded = decipher.update(encryptedData, 'binary', 'utf8');
      decoded += decipher.final('utf8');

      decoded = JSON.parse(decoded);
    } catch (err) {
      throw new Error('Illegal Buffer');
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
    const notifyUrl = 'https://api.huanjiaohu.com/admin/notice/handleWxNotify';
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
