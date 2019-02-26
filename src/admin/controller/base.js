module.exports = class extends think.Controller {
  async __before() {
    // 根据token值获取用户id
    this.ctx.state.token = this.ctx.header['authorization'] || this.get('authorization') || '';
    const tokenSerivce = think.service('token', 'api');
    this.ctx.state.user = await tokenSerivce.getUser(this.ctx.state.token);
    const publicController = this.config('publicController');
    const publicAction = this.config('publicAction');
    // 如果为非公开，则验证用户是否登录
    const controllerAction = this.ctx.controller + '/' + this.ctx.action;
    if (!publicController.includes(this.ctx.controller) && !publicAction.includes(controllerAction)) {
      // const userId = this.post('userId');
      if (!this.ctx.state.user || this.ctx.state.user.id <= 0) {
        return this.fail(401, '请先登录');
      } else if (this.ctx.state.user.type.indexOf('yy') >= 0) {
        return this.fail(401, '无权访问');
      } else {
        if (this.ctx.state.user.type.indexOf('admin') < 0) {
          if (this.ctx.controller === 'ad' && this.ctx.state.user.type.indexOf('xtgly') < 0) {
            return this.fail(401, '无权访问');
          }
          if (this.ctx.controller === 'group' || this.ctx.controller === 'cart' || this.ctx.controller === 'bill' || this.ctx.controller === 'brand') {
            if (this.ctx.state.user.type.indexOf('tggly') < 0 && this.ctx.state.user.type.indexOf('cjtz') < 0 && this.ctx.state.user.type.indexOf('cjy') < 0) {
              return this.fail(401, '无权访问');
            }
          }
          if (this.ctx.controller === 'service' && this.ctx.state.user.type.indexOf('yhgly') < 0) {
            return this.fail(401, '无权访问');
          }
          if (this.ctx.controller === 'user' && this.ctx.state.user.type.indexOf('yhgly') < 0) {
            return this.fail(401, '无权访问');
          }
          if (this.ctx.controller === 'material' && this.ctx.state.user.type.indexOf('bkgly') < 0) {
            return this.fail(401, '无权访问');
          }
        }
      }
    }
  }

  /**
     * 获取时间戳
     * @returns {Number}
     */
  getTime() {
    return parseInt(Date.now() / 1000);
  }

  /**
     * 获取当前登录用户的id
     * @returns {*}
     */
  getLoginUserId() {
    return this.ctx.state.user.id;
  }

  getLoginUser() {
    return this.ctx.state.user;
  }
};
