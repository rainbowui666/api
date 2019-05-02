// default config
module.exports = {
  // 可以公开访问的Controller
  publicController: [
    // 格式为controller
    'index',
    'topic',
    'auth',
    'goods',
    'brand',
    'search'
  ],

  // 可以公开访问的Action
  publicAction: [
    'pay/notify',
    'pay/meinotify'
  ]
};
