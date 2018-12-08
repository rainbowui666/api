const Base = require('./base.js');
const fs = require('fs');
const _ = require('lodash');
const images = require('images');

module.exports = class extends Base {
  async deleteImageAction() {
    const material = await this.model('material').where({id: this.post('materialId')}).find();
    const filePath = think.config('image.material') + '/' + material.category + '/' + this.post('imgName');
    fs.unlinkSync(filePath);
  }
  async deleteAction() {
    const material = await this.model('material').where({id: this.post('materialId')}).find();
    const filePath = think.config('image.material') + '/' + material.category + '/';
    const files = fs.readdirSync(filePath);
    const results = [];
    _.each(files, (filename) => {
      if (filename.indexOf(material.code) >= 0) {
        results.push(filename);
      }
    });
    _.each(results, (file) => {
      fs.unlinkSync(filePath + '/' + file);
    });
    await this.model('material').where({id: this.post('materialId')}).delete();
  }
  async addAction() {
    const tag = this.post('tag') ? this.post('tag').replace(/，/ig, ',') : '';
    const materialObj = {
      name: this.post('name'),
      ename: this.post('ename'),
      sname: this.post('sname'),
      category: this.post('category'),
      type: this.post('type'),
      tag: tag,
      code: this.post('code'),
      level: this.post('level'),
      price: this.post('price'),
      compatibility: this.post('compatibility'),
      description: this.post('description'),
      classification: this.post('description')
    };
    const material = await this.model('material').where({code: materialObj.code, category: materialObj.category}).find();
    if (!think.isEmpty(material)) {
      this.fail('编码已经存在');
    } else {
      const material = await this.model('material').where({name: materialObj.name, category: materialObj.category}).find();
      if (!think.isEmpty(material)) {
        this.fail('名字已经存在');
      } else {
        const id = await this.model('material').add(materialObj);
        const material = await this.model('material').where({ id: id }).find();
        this.json(material);
      }
    }
  }
  async uploadAction() {
    const code = this.post('code');
    const category = this.post('category');
    const img = this.file('img');
    const _name = img.name;
    const tempName = _name.split('.');
    let timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    const name = timestamp + '-' + code + '.' + tempName[1];
    const path = this.config('image.material') + '/' + category + '/' + name;
    const smallPath = this.config('image.material') + '/small/' + category + '/' + name;
    return new Promise((resolve, reject) => {
      fs.createWriteStream(path);
      const returnPath = `/${category}/${name}`;
      images(path).size(150).save(smallPath, {
        quality: 75
      });
      resolve(this.json({'imgPath': returnPath}));
    });
  }
  async updateAction() {
    const tag = this.post('tag') ? this.post('tag').replace(/，/ig, ',') : '';
    const materialObj = {
      name: this.post('name'),
      ename: this.post('ename'),
      sname: this.post('sname'),
      category: this.post('category'),
      type: this.post('type'),
      tag: tag,
      code: this.post('code'),
      level: this.post('level'),
      price: this.post('price'),
      compatibility: this.post('compatibility'),
      description: this.post('description'),
      classification: this.post('description')
    };
    await this.model('material').where({id: this.post('materialId')}).update(materialObj);
  }

  async focusAction() {
    const userId = this.getLoginUserId();
    const focus = await this.model('focus').where({user_id: userId, material_id: this.post('materialId')}).find();
    if (think.isEmpty(focus)) {
      await this.model('focus').add({user_id: userId, material_id: this.post('materialId')});
    } else {
      await this.model('focus').where({user_id: userId, material_id: this.post('materialId')}).delete();
    }
    this.success(true);
  }
  async focusListAction() {
    const userId = this.getLoginUserId();
    const page = this.post('page') || 1;
    const size = this.post('size') || 10;
    const model = this.model('material').alias('m');
    model.field(['m.*']).join({
      table: 'focus',
      join: 'inner',
      as: 'f',
      on: ['f.material_id', 'm.id']
    });
    const list = await model.where({'f.user_id': userId}).page(page, size).countSelect();
    this.json(list);
  }
};
