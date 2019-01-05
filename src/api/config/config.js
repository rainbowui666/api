// default config
module.exports = {
  // 可以公开访问的Controller
  publicController: [
    'region'
  ],

  // 可以公开访问的Action
  publicAction: [
    'comment/list',
    'comment/count',
    'user/loginByCode',
    'user/loginByPassword',
    'user/checkName',
    'user/forgetPassword',
    'user/register',
    'user/getAvatar',
    'user/getLocationAvatar',
    'ad/getNumber',
    'notice/get',
    'notice/handleWxNotify',
    'notice/check',
    'material/categoryAll',
    'material/category',
    'material/list',
    'material/get',
    'material/getImage',
    'material/getImageSmall',
    'material/randomList',
    'material/randomImageList',
    'location/getChina',
    'location/getProvinces'
  ]
};
