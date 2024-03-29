const Base = require('./base.js');
const rp = require('request-promise');
const moment = require('moment');
const md5 = require('md5');
const http = require('http');
const url = require('url');
const fs = require('fs');
const _ = require('lodash');
const images = require('images');
const qr = require('qr-image');
module.exports = class extends Base {
  async login() {
    const name = this.post('name');
    const password = md5(this.post('password'));
    const user = await this.model('user').where({ name: name, password: password }).find();
    if (think.isEmpty(user)) {
      return this.fail('用户名密码不正确');
    } else if (user.status === 0) {
      return this.fail('该用户已经失效请联系管理员');
    } else {
      const TokenSerivce = this.service('token', 'api');
      const sessionKey = await TokenSerivce.create(user);
      if (think.isEmpty(sessionKey)) {
        return this.fail('登录失败');
      }
      user.token = sessionKey;
      return this.json(user);
    }
  }

  async logoutAction() {
    const user = this.getLoginUser();
    if (think.isEmpty(user)) {
      return this.fail('该用户不存在');
    } else {
      const TokenSerivce = this.service('token', 'api');
      const sessionKey = await TokenSerivce.create(user);
      if (think.isEmpty(sessionKey)) {
        return this.fail('登出失败');
      }
    }
  }

  async loginByPasswordAction() {
    if (this.post('isError')) {
      const auth = this.post('auth');
      const code = await this.cache(this.post('requestId'));
      if (think.isEmpty(code)) {
        this.fail('验证码失效');
      } else if (code !== auth) {
        this.fail('验证码不正确');
      } else {
        await this.controller('user').login();
      }
    } else {
      await this.controller('user').login();
    }
  }
  async userEntryAction() {
    const code = this.post('code');
    const appid = think.config('weixin.public_appid');
    const secret = think.config('weixin.public_secret');
    // 获取unionid
    const options = {
      method: 'GET',
      url: 'https://api.weixin.qq.com/sns/oauth2/access_token',
      qs: {
        grant_type: 'authorization_code',
        code: code,
        secret: secret,
        appid: appid
      }
    };

    let sessionData = await rp(options);
    sessionData = JSON.parse(sessionData);
    const user = await this.model('user').where({ unionid: sessionData.unionid }).find();
    await this.model('user').where({ id: user.id }).update({
      insert_date: moment().format('YYYYMMDD'),
      headimgurl: sessionData.headimgurl,
      public_openid: sessionData.openid
    });
    return this.success(true);
  }
  async loginByCodeAction() {
    const code = this.post('code');
    const from = this.post('from');
    const appid = from ? 'wx6689f1d6479c5425' : think.config('weixin.public_appid');
    const secret = from ? '43f4cbef1445051cbbd4edb6c23b0fa2' : think.config('weixin.public_secret');
    // 获取unionid
    const options = {
      method: 'GET',
      url: 'https://api.weixin.qq.com/sns/oauth2/access_token',
      qs: {
        grant_type: 'authorization_code',
        code: code,
        secret: secret,
        appid: appid
      }
    };

    let sessionData = await rp(options);
    sessionData = JSON.parse(sessionData);
    if (!sessionData.unionid) {
      return this.fail('登录失败');
    }
    // 根据unionid查找用户是否已经注册
    let user = await this.model('user').where({ unionid: sessionData.unionid, type: ['!=', 'yy'] }).find();
    if (think.isEmpty(user)) {
      const options = {
        method: 'GET',
        url: 'https://api.weixin.qq.com/sns/userinfo',
        qs: {
          access_token: sessionData.access_token,
          openid: sessionData.openid
        }
      };

      const userInfoJson = await rp(options);
      const userInfo = JSON.parse(userInfoJson);

      // const userInfoObj = await this.model('user').where({ name: userInfo.nickname, type: 'cjtz' }).find();
      // eslint-disable-next-line no-dupe-keys
      const userInfoObj = await this.model('user').where({name: userInfo.nickname, _complex: {type: 'cjy', type: 'cjtz', _logic: 'or'}}).find();
      if (!think.isEmpty(userInfoObj)) {
        user = userInfoObj;
        // 更新登录信息
        await this.model('user').where({ id: user.id }).update({
          insert_date: moment().format('YYYYMMDD'),
          headimgurl: sessionData.headimgurl,
          unionid: sessionData.unionid
        });
        // 获得token
        const TokenSerivce = this.service('token', 'api');
        const sessionKey = await TokenSerivce.create(user);

        if (think.isEmpty(sessionKey)) {
          return this.fail('登录失败');
        }
        user.token = sessionKey;
        delete user['password'];
        return this.json(user);
      } else {
        return this.json({
          type: 'yy'
        });
        // const userInfoObj = await this.model('user').where({ name: userInfo.nickname, type: 'cjy' }).find();
        // if (!think.isEmpty(userInfoObj)) {
        //   user = userInfoObj;
        // } else {
        //   return this.json({
        //     type: 'yy'
        //   });
        // }

        // user = {
        //   name: userInfo.nickname,
        //   nickname: userInfo.nickname,
        //   password: '0ff8ecf84a686258caeb350dbc8040d6',
        //   city: 'shc',
        //   phone: '18888888888',
        //   type: 'yy',
        //   province: 'sh',
        //   country: userInfo.country,
        //   headimgurl: userInfo.headimgurl || '',
        //   sex: userInfo.sex || 1, // 性别 0：未知、1：男、2：女
        //   province_name: userInfo.province,
        //   city_name: userInfo.city,
        //   unionid: userInfo.unionid
        // };
        // user.id = await this.model('user').add(user);
        // await this.model('user_type_relation').add({'user_id': user.id, 'type_id': 1});
      }
    } else {
      await this.model('user').where({ id: user.id }).update({
        insert_date: moment().format('YYYYMMDD'),
        headimgurl: sessionData.headimgurl
      });
      // 获得token
      const TokenSerivce = this.service('token', 'api');
      const sessionKey = await TokenSerivce.create(user);

      if (think.isEmpty(sessionKey)) {
        return this.fail('登录失败');
      }
      user.token = sessionKey;
      delete user['password'];
      return this.json(user);
    }
  }

  async checkNameAction() {
    const count = await this.model('user').where({ name: this.post('name') }).count();
    if (count >= 1) {
      return this.fail('用户名已经存在');
    }
  }
  async checkPhoneAction() {
    const user = await this.model('user').field(['phone']).where({ id: this.getLoginUserId() }).find();
    if (!user.phone || user.phone === '18888888888') {
      this.json({'isBindPhone': false});
    } else {
      this.json({'isBindPhone': true});
    }
  }
  async forgetPasswordAction() {
    const auth = this.post('auth');
    const code = await this.cache(this.post('requestId'));
    if (think.isEmpty(code)) {
      this.fail('验证码失效');
    } else if (code !== auth) {
      this.fail('验证码不正确');
    } else {
      const user = await this.model('user').field(['phone']).where({ name: this.post('name') }).find();
      if (!user.phone || user.phone === '18888888888') {
        this.fail('未绑定手机');
      } else if (user.phone !== this.post('phone')) {
        this.fail('手机号和注册手机号不一致');
      } else {
        this.json(user);
      }
    }
  }

  async registerAction() {
    const password1 = this.post('password1');
    const password2 = this.post('password2');
    const name = this.post('name');
    const phone = this.post('phone');
    const auth = this.post('auth');
    const requestId = this.post('requestId');
    const code = await this.cache(requestId);
    if (think.isEmpty(code)) {
      this.fail('验证码失效');
    } else if (code !== auth) {
      this.fail('验证码不正确');
    } else if (password1 !== password2) {
      this.fail('两次输入的密码不匹配');
    } else {
      const user = await this.model('user').where({name: name}).find();
      if (!think.isEmpty(user)) {
        this.fail('用户名已经存在');
      } else {
        const user = {
          name: name,
          nickname: name,
          password: md5(password1),
          phone: phone,
          type: 'yy'
        };
        user.id = await this.model('user').add(user);
        await this.model('user_type_relation').add({'user_id': user.id, 'type_id': 1});
        if (user.id > 0) {
          const cityObj = await this.controller('tools').getCityByPhoneAction(phone);
          if (cityObj) {
            this.model('user').where({ 'id': user.id }).update({city: cityObj.mark, province: cityObj.area, city_name: cityObj.city, province_name: cityObj.province});
          }
          this.success('注册成功');
        } else {
          this.fail('注册失败');
        }
      }
    }
  }

  // async testAction() {
  //   const recommend = 31;
  //   if (recommend) {
  //     // if (counts.length === 3) {
  //     //   await this.controller('cart', 'mall').addAction(1181039, 492, 1, recommend, 'gift');
  //     // }
  //     await this.controller('cart', 'mall').addAction(1181029, 682, 1, recommend, 'gift');
  //     await this.controller('cart', 'mall').addAction(1181023, 356, 1, recommend, 'gift');
  //   }
  // }

  async loginByMiniProgramAction() {
    const avatarUrl = this.post('avatarUrl');
    const name = this.post('name');
    const phone = this.post('phone');
    const code = this.post('code');
    const recommend = this.post('recommend');

    const result = await this.service('weixin', 'api').getSessionKeyByCode(code);
    let user = await this.model('user').where({ openid: result.openid }).find();
    user = think.isEmpty(user) ? await this.model('user').where({phone}).find() : user;

    if (think.isEmpty(user)) {
      user = {
        name: name,
        nickname: name,
        password: md5('coral123'),
        phone: phone,
        type: 'yy'
      };
      if (recommend) {
        user['recommend'] = recommend;
      }
      user.id = await this.model('user').add(user);
      await this.model('user_type_relation').add({'user_id': user.id, 'type_id': 1});

      if (recommend) {
        const counts = await this.model('user').where({recommend}).select() || [];
        if (counts.length === 3) {
          await this.controller('cart', 'mall').addAction(1181039, 492, 1, recommend, 'gift');
        }
        if (counts.length === 6) {
          await this.controller('cart', 'mall').addAction(1181029, 682, 1, recommend, 'gift');
        }
        if (counts.length === 9) {
          await this.controller('cart', 'mall').addAction(1181023, 356, 1, recommend, 'gift');
        }
        var t = new Date();
        var iToDay = t.getDate();
        var iToMon = t.getMonth();
        var iToYear = t.getFullYear();
        var newDay = new Date(iToYear, iToMon, (iToDay + 30));

        const coupon = {
          coupon_id: 4,
          user_id: user.id,
          coupon_number: '1',
          used_time: newDay.getTime() / 1000,
          order_id: 0
        };
        await this.model('user_coupon').add(coupon);
        const coupon1 = {
          coupon_id: 13,
          user_id: user.id,
          coupon_number: '1',
          used_time: newDay.getTime() / 1000,
          order_id: 0
        };
        await this.model('user_coupon').add(coupon1);
        const coupon2 = {
          coupon_id: 14,
          user_id: user.id,
          coupon_number: '1',
          used_time: newDay.getTime() / 1000,
          order_id: 0
        };
        await this.model('user_coupon').add(coupon2);
      }
    }

    user.headimgurl = avatarUrl;
    user.unionid = result.unionid;
    user.openid = result.openid;
    user.nickname = name;
    user.name = name;
    user.phone = phone;
    const cityObj = await this.controller('tools').getCityByPhoneAction(phone);
    if (cityObj) {
      user.city = cityObj.mark;
      user.province = cityObj.area;
      user.city_name = cityObj.city;
      user.province_name = cityObj.province;
    }
    if (!user.tag) {
      user.tag = ['青魔'];
    }
    await this.model('user').where({ 'id': user.id }).update(user);
    const types = await this.model('user_type_relation').where({ 'user_id': user.id }).select();
    const tokenSerivce = this.service('token', 'api');
    const sessionKey = await tokenSerivce.create(user);
    user.token = sessionKey;
    delete user.password;

    return this.json({user, types});
  }

  async getAvatarAction(_userId) {
    const userId = _userId || this.get('userId');
    const key = 'getAvatarAction1' + userId;
    const avatar = await this.cache(key);
    if (avatar) {
      this.type = 'image/jpeg';
      this.body = Buffer.from(avatar, 'base64');
      return this.body;
    } else {
      const user = await this.model('user').field(['headimgurl']).where({ id: userId }).find();
      if (user.headimgurl) {
        return new Promise((resolve, reject) => {
          const urlObject = url.parse(user.headimgurl);
          const options = {
            hostname: urlObject.host,
            port: urlObject.port,
            path: urlObject.path,
            method: 'GET'
          };
          const req = http.request(options, (resUrl) => {
            resUrl.on('data', (chunk) => {
              const decodeImg = Buffer.from(chunk.toString('base64'), 'base64');
              this.cache(key, resolve(this.body = decodeImg));
              this.type = 'image/jpeg';
              resolve(this.body = decodeImg);
            });
          });
          req.on('error', (e) => {
            reject(e);
          });
          req.end();
        });
      } else {
        const readDir = fs.readdirSync(this.config('image.user'));
        let path = null;
        let _type = 'png';
        _.each(readDir, (itm) => {
          const filedId = itm.split('.')[0];
          if (Number(filedId) === Number(userId)) {
            path = this.config('image.user') + '/' + itm;
            _type = itm.split('.')[1];
          }
        });
        if (path) {
          const image = fs.readFileSync(path);
          const decodeImg = Buffer.from(image.toString('base64'), 'base64');
          this.type = 'image/' + _type;
          this.cache(key, decodeImg);
          this.body = decodeImg;
        } else {
          const decodeImg = Buffer.from(this.config('image.defaultUserAvatar'), 'base64');
          this.type = 'image/png';
          this.cache(key, decodeImg);
          this.body = decodeImg;
        };
        return this.body;
      }
    }
  }
  async getUserByTokenAction() {
    const token = this.post('token');
    const tokenSerivce = think.service('token');
    const user = await tokenSerivce.getUser(token);
    this.json(user);
  }
  async getByIdAction() {
    const user = await this.model('user').where({id: this.post('userId')}).find();
    const focus = await this.model('focus').where({'user_id': user.id, material_id: ['!=', null]}).count();
    user.focusNo = focus || 0;
    delete user.password;
    delete user.phone;
    delete user.latitude;
    delete user.longitude;
    this.json(user);
  }
  async updateAction() {
    const userId = this.getLoginUserId();
    const user = {
      city: this.post('city'),
      province: this.post('province'),
      phone: this.post('phone'),
      code: this.post('code'),
      address: this.post('address'),
      description: this.post('description'),
      contacts: this.post('contacts'),
      status: this.post('status'),
      latitude: this.post('latitude'),
      longitude: this.post('longitude'),
      point: this.post('point') || 0
    };
    await this.model('user').where({id: userId}).update(user);
    if (think.isEmpty(this.post('city')) && !think.isEmpty(this.post('phone'))) {
      const cityObj = await this.controller('tools', 'api').getCityByPhoneAction(this.post('phone'));
      if (cityObj) {
        this.model('user').where({ 'id': userId }).update({city: cityObj.mark, province: cityObj.area, city_name: cityObj.city, province_name: cityObj.province});
      }
    }
    this.json('OK');
  }
  async uploadAvatarAction() {
    const avatar = this.file('avatar');
    const id = this.post('userId');
    const files = fs.readdirSync(this.config('image.user'));
    if (!think.isEmpty(files)) {
      files.forEach((itm, index) => {
        const filedId = itm.split('.')[0];
        if (Number(filedId) === id) {
          fs.unlinkSync(this.config('image.user') + '/' + itm);
        }
      });
    }
    const _name = avatar.name;
    const tempName = _name.split('.');
    const name = id + '.' + tempName[1];
    const tempPath = this.config('image.user') + '/temp/' + name;
    fs.renameSync(avatar.path, tempPath);
    await this.cache('getAvatarAction' + id, null);
    images(tempPath + '').resize(150).save(this.config('image.user') + '/' + name);
  }

  async getByTypeAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const province = this.post('province');
    const whereMap = {};
    const type = this.post('type');
    if (type === 'pfs' || type === 'lss' || type === 'cjtz' || type === 'tz' || type === 'qcs') {
      whereMap['type'] = type;
      if (!think.isEmpty(province)) {
        whereMap['province'] = province;
      }
      const users = await this.model('user').where(whereMap).order(['id DESC']).page(page, size).countSelect();
      for (const item of users.data) {
        delete item.password;
      }
      this.json(users);
    } else {
      this.json([]);
    }
  }
  async getLocationAvatarAction() {
    const userId = this.get('userId');
    const key = 'getLocationAvatarAction' + userId;
    const avatar = await this.cache(key);
    if (avatar) {
      this.type = 'image/png';
      this.body = Buffer.from(avatar, 'base64');
      return this.body;
    } else {
      const userAvatar = await this.controller('user').getAvatarAction(userId);
      const bg = this.config('image.user') + '/bg.png';
      const temp = this.config('image.user') + '/temp.png';
      const locationUser = this.config('image.user') + '/locationUser.png';
      fs.writeFileSync(temp, userAvatar);
      images(bg).draw(images(temp).resize(32), 2, 2).save(locationUser);
      const image = fs.readFileSync(locationUser);
      const decodeImg = Buffer.from(image.toString('base64'), 'base64');
      this.type = 'image/png';
      this.cache(key, decodeImg);
      this.body = decodeImg;
    }
  }

  async decryptUserInfoDataAction() {
    const result = await this.service('weixin', 'api').getSessionKeyByCode(this.post('code'));
    //     { session_key: 'qITkzFr79I1LVbKPD/62Jw==',
    // 0|jyhs  |   openid: 'oeSe94uLH-KrxqGfMIao6l-x1b9U',
    // 0|jyhs  |   unionid: 'ohbZ81rojJDLl6nZVjzIldmw5bMk' }
    const WXSerivce = this.service('weixin', 'api');
    const sessionKey = result.session_key;
    const encryptedData = this.post('encryptedData');
    const iv = this.post('iv');
    const userInfo = WXSerivce.decryptUserInfoData(sessionKey, encryptedData, iv);
    this.json(userInfo);
  }

  async getCouponAction() {
    const model = this.model('user_coupon').alias('u');
    model.field(['u.*', 'c.name', 'c.tag', 'c.description', 'c.price', 'c.price_condition']).join({
      table: 'coupon',
      join: 'inner',
      as: 'c',
      on: ['u.coupon_id', 'c.id']
    });
    const couponList = await model.where({'u.used': 0, 'u.user_id': this.getLoginUserId(), used_time: ['>', new Date().getTime() / 1000]}).select();
    for (const c of couponList) {
      c.time = think.datetime(new Date(c.used_time * 1000), 'YYYY-MM-DD');
    }
    this.json(couponList);
  }

  async useingCouponAction() {
    const id = this.post('id');
    await this.model('user_coupon').where({'used': 0, 'user_id': this.getLoginUserId(), used_time: ['>', new Date().getTime() / 1000]}).update({'useing': 0});
    await this.model('user_coupon').where({id}).update({'useing': 1});
    this.success('操作成功');
  }

  async resetCouponAction() {
    await this.model('user_coupon').where({'useing': 1, 'user_id': this.getLoginUserId(), used_time: ['>', new Date().getTime() / 1000]}).update({'useing': 0});
    this.success('操作成功');
  }
  async getAccountListAction() {
    const list = await this.model('user_account').where({'user_id': this.getLoginUserId()}).order('id desc').select();
    let account = 0;
    for (const item of list) {
      account += item.account;
      item.time = think.datetime(new Date(item.insert_date), 'YYYY-MM-DD HH:mm:ss');
    }
    this.json({account, list});
  }
  async pointAction() {
    const code = this.post('code');
    const pointObj = await this.model('user').getPoint(this.getLoginUserId(), code);
    let message = null;
    switch (code) {
      case 'qd':
        if (pointObj[0].point >= 10) {
          message = '今日已签到';
        } else {
          await this.model('user_point').add({
            user_id: this.getLoginUserId(),
            point: 10,
            type: 'qd',
            description: '签到'
          });
          message = '+10分';
        }
        break;
      case 'share':
        if (pointObj[0].point >= 100) {
          message = '今日分享上限';
        } else {
          await this.model('user_point').add({
            user_id: this.getLoginUserId(),
            point: 10,
            type: 'share',
            description: '分享成功奖励'
          });
          message = '+10分';
        }
        break;
      case 'circle':
        if (pointObj[0].point >= 100) {
          message = '今日发表积分上限';
        } else {
          await this.model('user_point').add({
            user_id: this.getLoginUserId(),
            point: 10,
            type: 'circle',
            description: '鱼圈发表成功奖励'
          });
          message = '+10分';
        }
        break;
      case 'comment':
        if (pointObj[0].point >= 100) {
          message = '今日评论积分上限';
        } else {
          await this.model('user_point').add({
            user_id: this.getLoginUserId(),
            point: 10,
            type: 'comment',
            description: '鱼圈评论成功奖励'
          });
          message = '+10分';
        }
        break;
      case 'material':
        if (pointObj[0].point >= 50) {
          message = '今日评论积分上限';
        } else {
          await this.model('user_point').add({
            user_id: this.getLoginUserId(),
            point: 10,
            type: 'material',
            description: '百科评论成功奖励'
          });
          message = '+10分';
        }
        break;
      default:
        break;
    }
    return this.success(message);
  }

  async taskListAction() {
    const pointObj = await this.model('user').getTask(this.getLoginUserId());
    return this.json(pointObj);
  }

  async pointListAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 100;
    const list = await this.model('user_point').where({'user_id': this.getLoginUserId()}).order('id desc').page(page, size).countSelect();
    let point = 0;
    for (const item of list.data) {
      point += item.point;
      item.time = think.datetime(new Date(item.insert_date), 'YYYY-MM-DD HH:mm:ss');
    }
    this.json({point, list});
  }
  async chnageCouponAction() {
    const point = this.post('point');
    const re = /^[0-9]*[0-9]$/i;
    if (re.test(point) && point >= 1000 && point % 100 === 0) {
      const sum = await this.model('user_point').where({'user_id': this.getLoginUserId()}).sum('point');
      if (sum > point) {
        await this.model('user_point').add({
          user_id: this.getLoginUserId(),
          point: -point,
          type: 'dhyhq',
          description: '兑换优惠券'
        });
        const end = new Date(new Date().getTime() + 7 * 24 * 3600 * 1000);

        const page = point / 1000;

        for (let i = 0; i < page; i++) {
          const coupon = {
            coupon_id: 10,
            user_id: this.getLoginUserId(),
            coupon_number: '1',
            used_time: end.getTime() / 1000,
            order_id: 0
          };
          await this.model('user_coupon').add(coupon);
        }

        return this.success('兑换成功');
      } else {
        return this.fail('积分不足');
      }
    } else {
      return this.fail('需要1000的倍数');
    }
  }

  shareImgAction() {
    const id = this.get('userId');
    const qrSvg = qr.imageSync(`https://group.huanjiaohu.com?recommend=${id}`, { type: 'png' });
    const savePath = `/usr/local/nginx/html/static/image/user/share/${id}.jpg`;
    images('/usr/local/nginx/html/static/mini/index/active.jpg').draw(images(qrSvg).resize(240), 374, 520).save(savePath);
    const image = fs.readFileSync(savePath);
    const decodeImg = Buffer.from(image.toString('base64'), 'base64');
    this.type = 'image/jpg';
    this.body = decodeImg;
  }

  async checkRecommendAction() {
    const id = this.getLoginUserId();
    const user = await this.model('user').where({recommend: id}).select() || [];
    const recommend = user.length ? user[0].recommend : null;
    return this.json({recommend});
  }

  async getRecommendListAction() {
    const id = this.getLoginUserId();
    const userList = await this.model('user').where({recommend: id}).select();
    return this.json(userList);
  }
  async publishCouponListAction() {
    const couponObj = await this.model('coupon').where({isPublish: 1}).select();
    var today = new Date();
    var nd = new Date();
    nd = nd.valueOf();
    nd = nd + 7 * 24 * 60 * 60 * 1000;
    nd = new Date(nd);
    var y = nd.getFullYear();
    var m = nd.getMonth() + 1;
    var d = nd.getDate();
    if (m <= 9) m = '0' + m;
    if (d <= 9) d = '0' + d;
    var cdate = y + '-' + m + '-' + d;
    for (const c of couponObj) {
      c['priceCondition'] = c['price_condition'];
      c['effortDate'] = cdate;
      c['userCoupon'] = await this.model('user_coupon').where({coupon_id: c.id, user_id: this.getLoginUserId(), used_time: ['>', today.getTime() / 1000], used: 0}).find() || null;
    }
    this.json(couponObj);
  }

  async getACouponAction() {
    const couponId = this.post('couponId');
    const t = new Date();
    const c = await this.model('user_coupon').where({coupon_id: couponId, user_id: this.getLoginUserId(), used_time: ['>', t.getTime() / 1000]}).find() || {};
    if (think.isEmpty(c)) {
      const iToDay = t.getDate();
      const iToMon = t.getMonth();
      const iToYear = t.getFullYear();
      const newDay = new Date(iToYear, iToMon, (iToDay + 7));
      const coupon = {
        coupon_id: couponId,
        user_id: this.getLoginUserId(),
        coupon_number: '1',
        used_time: newDay.getTime() / 1000,
        order_id: 0
      };
      await this.model('user_coupon').add(coupon);
      return this.json({msg: '领取成功'});
    } else {
      return this.json({msg: '已经领了'});
    }
  }

  async testAction() {
    // const orderService = this.service('mall_order', 'mall');
    const groupId = this.post('group_id') || 1;
    const goodsId = this.post('goods_id') || 1;
    const owerUserId = this.post('ower_user_id') || 1;
    const userId = this.getLoginUserId();
    const date = new Date().getTime() / 1000;
    const group = await this.model('mall_group').where({id: groupId, 'end_time': ['>=', date]}).find();
    if (think.isEmpty(group)) {
      return this.fail('砍价活动结束了');
    }

    const cuts = await this.model('mall_group_cut').where({group_id: groupId}).select();
    let user = _.find(cuts, (cut) => {
      return cut.user_id === userId;
    });
    let price = 0;
    _.each(cuts, (cut) => {
      price += cut.cut_price;
    });
    group.market_price = 19;
    const totleCurPrice = group.market_price - price - group.group_price;

    user = null;
    if (think.isEmpty(user)) {
      const ran = price === 0 ? 99 : Math.ceil(Math.random() * 100);
      let cutPrice = 0;
      if (ran < 55) {
        cutPrice = Math.ceil(Math.random() * totleCurPrice / 4);
      } else if (ran > 55 < 95) {
        cutPrice = Math.ceil(Math.random() * totleCurPrice / 3);
      } else if (ran > 95 < 100) {
        cutPrice = Math.ceil(Math.random() * totleCurPrice / 2);
      }

      this.model('mall_group_cut').add({
        goods_id: goodsId,
        group_id: groupId,
        user_id: userId,
        ower_user_id: owerUserId,
        cut_price: cutPrice
      });
    } else {
      return this.fail('您已经砍了一刀了');
    }
  }
};
