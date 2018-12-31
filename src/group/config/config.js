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
    'group/get'
  ]
};
