// default config
module.exports = {
  // 可以公开访问的Controller
  publicController: [
  ],

  // 可以公开访问的Action
  publicAction: [
    'bill/list',
    'bill/getCategoryList',
    'bill/get',
    'bill/getDetailByBillId',
    'bill/getDetailByBillIdAndCategory',
    'group/list',
    'group/get',
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
    'material/randomImageList'
  ]
};
