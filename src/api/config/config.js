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
