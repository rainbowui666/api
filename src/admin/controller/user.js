const Base = require('./base.js');
const md5 = require('md5');
const _ = require('lodash');
module.exports = class extends Base {
  async typeAction() {
    const list = this.model('user_type').select();
    const user = this.getLoginUser();
    if (user['type'] !== 'admin') {
      list.pop();
    }
    return this.json(list);
  }

  async getLikeMaterialAction() {
    const list = await this.model('user').getUserLikeMaterial(this.post('userId'));
    this.json(list);
  }
  async getCartListAction() {
    const list = await this.controller('cart', 'admin').listAction(this.post('userId'));
    this.json(list);
  }

  async deleteCartAction() {
    await this.controller('cart', 'admin').deleteAction(this.post('cartId'));
  }

  async getByTypeAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const province = this.post('province');
    const whereMap = {};
    whereMap['type'] = this.post('type');
    if (!think.isEmpty(province)) {
      whereMap['province'] = province;
    }
    const users = await this.model('user').where(whereMap).order(['id DESC']).page(page, size).countSelect();
    for (const item of users.data) {
      delete item.password;
    }
    this.json(users);
  }

  async listAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const name = this.post('name');
    const city = this.post('city');
    const province = this.post('province');
    const type = this.post('type');
    const whereMap = {};
    if (!think.isEmpty(province)) {
      whereMap['u.province'] = province;
    }
    if (!think.isEmpty(type)) {
      const typeDef = await this.model('user_type').where({'code': type}).find();
      whereMap['r.type_id'] = typeDef.id;
    }
    if (!think.isEmpty(city)) {
      whereMap['u.city'] = city;
    }
    if (!think.isEmpty(name)) {
      whereMap['u.name'] = ['like', `%${name}%`];
    }
    const model = this.model('user').alias('u');
    const list = await model.field(['u.*', 'c.name city_name', 'p.name province_name'])
      .join({
        table: 'citys',
        join: 'inner',
        as: 'c',
        on: ['u.city', 'c.mark']
      })
      .join({
        table: 'provinces',
        join: 'inner',
        as: 'p',
        on: ['u.province', 'p.code']
      })
      .join({
        table: 'user_type_relation',
        join: 'inner',
        as: 'r',
        on: ['r.user_id', 'u.id']
      })
      .where(whereMap).order(['u.id DESC']).page(page, size).countSelect();

    for (const item of list.data) {
      const cartSummary = await this.model('cart').field(['count(id) count', 'IFNULL(sum(sum+freight),0) sum']).where({'user_id': item.id, 'is_confirm': 1}).find();
      item['sum'] = cartSummary.sum;
      item['count'] = cartSummary.sum ? cartSummary.count : cartSummary.sum;
      delete item.password;
    }
    this.json(list);
  }

  async updateUserCityAction() {
    const page = this.post('page') || 1;
    const size = this.post('size') || 2;
    const list = await this.model('user').where({phone: ['!=', '18888888888']}).order(['id DESC']).page(page, size).countSelect();
    for (const user of list.data) {
      const cityObj = await this.controller('tools', 'api').getCityByPhoneAction(user.phone);
      if (cityObj) {
        this.model('user').where({ 'id': user.id }).update({city: cityObj.mark, province: cityObj.area, city_name: cityObj.city, province_name: cityObj.province});
      }
    }
    this.json({'status': 'OK'});
  }

  async addTypeAction() {
    const code = this.post('code');
    const name = this.post('name');
    const description = this.post('description');
    const type = await this.model('user_type').where({'code': code}).find();
    if (think.isEmpty(type)) {
      this.model('user_type').add({
        name,
        code,
        description
      });
    } else {
      this.fail('该角色的code已经存在');
    }
  }

  async deleteUserTypeRelationAction() {
    const userId = this.post('userId');
    const typeId = this.post('typeId');
    const type = await this.model('user_type_relation').where({'userId': userId, 'typeId': typeId}).select();
    if (_.size(type) === 1) {
      this.fail('至少保留一个关系');
    } else {
      await this.model('user_type_relation').where({'userId': userId, 'typeId': typeId}).delete();
      const model = this.model('user_type').alias('t');
      model.field(['t.code']).join({
        table: 'user_type_relation',
        join: 'inner',
        as: 'r',
        on: ['r.type_id', 't.id']
      });
      const list = await model.where({'r.user_id': userId}).select();
      await this.model('user').where({'id': userId}).update({'type': list.join(',')});
    }
  }

  async addUserTypeRelationAction() {
    const userId = this.post('userId');
    const typeId = this.post('typeId');
    const type = await this.model('user_type_relation').where({'userId': userId, 'typeId': typeId}).find();
    if (think.isEmpty(type)) {
      await this.model('user_type_relation').add({
        'user_id': userId,
        'type_id': typeId
      });
      const model = this.model('user_type').alias('t');
      model.field(['t.code']).join({
        table: 'user_type_relation',
        join: 'inner',
        as: 'r',
        on: ['r.type_id', 't.id']
      });
      const list = await model.where({'r.user_id': userId}).select();
      await this.model('user').where({'id': userId}).update({'type': list.join(',')});
    } else {
      this.fail('该关系已经存在');
    }
  }

  async updateTypeAction() {
    const id = this.post('id');
    const code = this.post('code');
    const name = this.post('name');
    const description = this.post('description');
    await this.model('user_type').where({'id': id}).update({
      name,
      code,
      description
    });
  }

  async registerAction() {
    const password1 = this.post('password1');
    const password2 = this.post('password2');
    const name = this.post('name');
    const phone = this.post('phone');
    if (password1 !== password2) {
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
          await this.model('user_type_relation').add({'user_id': user.id, 'type_id': 1});
          const cityObj = await this.controller('tools', 'api').getCityByPhoneAction(phone);
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
};
