const Base = require('./base.js');
const rp = require('request-promise');
const moment = require('moment');
const md5 = require('md5');
const http = require('http');
const url = require('url');
const fs = require('fs');
const _ = require('lodash');
const images = require('images');
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
  async loginByCodeAction() {
    const code = this.post('code');
    const from = this.post('from');
    const appid = from ? think.config('weixin.mini_appid') : think.config('weixin.public_appid');
    const secret = from ? think.config('weixin.mini_secret') : think.config('weixin.public_secret');
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
    let user = sessionData.unionid ? await this.model('user').where({ unionid: sessionData.unionid }).find() : null;
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

      const userInfoObj = await this.model('user').where({ name: userInfo.nickname }).find();
      if (!think.isEmpty(userInfoObj)) {
        user = userInfoObj;
      } else {
        user = {
          name: userInfo.nickname,
          nickname: userInfo.nickname,
          password: '0ff8ecf84a686258caeb350dbc8040d6',
          city: 'shc',
          phone: '18888888888',
          type: 'yy',
          province: 'sh',
          country: userInfo.country,
          openid: userInfo.openid,
          headimgurl: userInfo.headimgurl || '',
          sex: userInfo.sex || 1, // 性别 0：未知、1：男、2：女
          province_name: userInfo.province,
          city_name: userInfo.city,
          unionid: userInfo.unionid
        };
        user.id = await this.model('user').add(user);
        await this.model('user_type_relation').add({'user_id': user.id, 'type_id': 1});
      }
    }
    // 更新登录信息
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
    return this.json(user);
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

  async getAvatarAction() {
    const userId = this.get('userId');
    const key = 'getAvatarAction' + userId;
    const avatar = await this.cache(key);
    if (avatar) {
      this.type = 'image/jpeg';
      this.body = Buffer.from(avatar, 'base64');
    } else {
      const user = await this.model('user').field(['headimgurl']).where({ id: userId }).find();
      if (!_.isEmpty(user.headimgurl)) {
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
    this.json(user);
  }
  async updateAction() {
    const userId = this.post('userId');

    const user = {
      city: this.post('city'),
      province: this.post('province'),
      phone: this.post('phone'),
      code: this.post('code'),
      address: this.post('address'),
      description: this.post('description'),
      contacts: this.post('contacts'),
      status: this.post('status'),
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
    images(tempPath + '').size(150).save(this.config('image.user') + '/' + name, {
      quality: 75
    });
  }

  async changPasswordAction() {
    await this.model('user').where({ id: this.post('userId') }).update({
      password: md5(this.post('password'))
    });
  }
};
