const Base = require('./base.js');
const _ = require('lodash');
const rp = require('request-promise');

module.exports = class extends Base {
  async getChinaAction() {
    const provinces = await this.model('provinces').select();
    const citys = await this.model('citys').select();
    _.each(provinces, (province) => {
      province['parent'] = 0;
    });
    _.each(citys, (city) => {
      if (city.type === 2) {
        provinces.push({'code': city.mark, 'name': city.name, 'parent': city.area});
      }
    });
    this.json(provinces);
  }
  async getCityByCodeAction() {
    const city = await this.model('citys').where({'mark': this.post('code')}).find();
    this.json(city);
  }
  async getCodeByCityAction() {
    const city = await this.model('citys').where({'name': this.post('city'), 'type': 2}).find();
    this.json(city);
  }
  async getCityByProvinceAction() {
    const citys = await this.model('citys').where({'area': this.post('province')}).select();
    const user = this.getLoginUser();
    if (user && user.type.indexOf('lss') >= 0) {
      const china = await this.model('citys').where({'area': 'china'}).find();
      citys.unshift(china);
    }
    this.json(citys);
  }
  async getProvincesAction() {
    const provinces = await this.model('provinces').select();
    this.json(provinces);
  }
  async getProvincesByCodeAction(code) {
    const provinces = await this.model('provinces').where({'code': this.post('code')}).find();
    this.json(provinces);
  }
  async searchLocationAction() {
    const region = await this.model('provinces').where({'code': this.post('province')}).find();
    const options = {
      method: 'GET',
      url: 'https://apis.map.qq.com/ws/place/v1/suggestion/',
      qs: {
        region: region.name,
        keyword: this.post('keyword'),
        key: think.config('weixin.mapKey')
      }
    };
    const sessionData = await rp(options);
    this.json(JSON.parse(sessionData));
  }
  async distanceAction() {
    const options = {
      method: 'GET',
      url: 'https://apis.map.qq.com/ws/distance/v1/',
      qs: {
        from: this.post('from'),
        to: this.post('to'),
        key: think.config('weixin.mapKey')
      }
    };

    const sessionData = await rp(options);
    this.json(JSON.parse(sessionData));
  }
  async getProvinceByLocationAction(location) {
    const options = {
      method: 'GET',
      url: 'https://apis.map.qq.com/ws/geocoder/v1/',
      qs: {
        location: location || this.post('location'),
        get_poi: 0,
        key: think.config('weixin.mapKey')
      }
    };

    const sessionData = await rp(options);
    this.json(JSON.parse(sessionData));
    return sessionData;
  }
};
