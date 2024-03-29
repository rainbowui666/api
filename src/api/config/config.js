// default config
module.exports = {
  // 可以公开访问的Controller
  publicController: [
    'region',
    'tools',
    'ad',
    'catalog'
  ],

  // 可以公开访问的Action
  publicAction: [
    'service/list',
    'comment/list',
    'comment/count',
    'user/loginByCode',
    'user/loginByPassword',
    'user/loginByMiniProgram',
    'user/checkName',
    'user/shareImg',
    'user/checkRecommend',
    'user/userEntry',
    'user/forgetPassword',
    'user/register',
    'user/getAvatar',
    'user/test',
    'user/getLocationAvatar',
    'user/decryptUserInfoData',
    'ad/getNumber',
    'notice/get',
    'notice/handleWxNotify',
    'notice/check',
    'material/categoryAll',
    'material/category',
    'material/count',
    'material/list',
    'material/get',
    'material/getImage',
    'material/getImageSmall',
    'material/randomList',
    'material/randomImageList',
    'active/getActiveList',
    'active/getLastActive',
    'location/getChina',
    'location/getProvinces',
    'information/getSubscriptionList',
    'information/getInformationById'
  ]
};
