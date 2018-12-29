// default config
module.exports = {
  // 可以公开访问的Controller
  publicController: [
  ],

  // 可以公开访问的Action
  publicAction: [
    'user/loginByCode',
    'user/loginByPassword',
    'user/checkName',
    'user/forgetPassword',
    'user/register',
    'user/getAvatar',
    'ad/getNumber',
    'notice/get',
    'notice/check',
    'location/getChina',
    'location/getProvinces'
  ]
};
