
module.exports = {
  default_module: 'api',
  defaultErrno: 406,
  validateDefaultErrno: 406,
  workers: 0,
  date_format: 'YYYY-MM-DD HH:mm:ss',
  jhsj: {
    phone_key: '29ae0de1fea82b9060cbc069b99b876a'
  },
  weixin: {
    // mini_appid: 'wx6689f1d6479c5425', // 小程序 appid
    // mini_secret: '43f4cbef1445051cbbd4edb6c23b0fa2', // 小程序密钥
    mini_appid: 'wx9f635f06da7360d7', // 小程序 appid
    mini_secret: 'ef11fda091769b57be6226beb2ba0294', // 小程序密钥
    public_appid: 'wx6edb9c7695fb8375', // 公众号 appid
    public_secret: '3e7b1b2235b7fdeed18afbb299a64683',
    subscribe_appid: 'wxac9b09c7abcca26e', // 公众号 appid
    subscribe_secret: '832f21bce42162f6f0c3176acfb65a73',
    book_url: 'https://mp.weixin.qq.com/mp/subscribemsg?action=get_confirm&appid=wx6edb9c7695fb8375&scene=1000&template_id=MBKFHUw6G4vVktlxqxu4BGRzH8u9xSBRaMDL0dUBJfU&redirect_url=http%3a%2f%2fgroup.huanjiaohu.com&book=done#wechat_redirect',
    mch_id: '1510134221', // 商户帐号ID
    partner_key: '3e7b1b2235b7fdeed18afbb299a64683', // 微信支付密钥
    notify_url: '', // 微信异步通知，例：https://www.nideshop.com/api/pay/notify
    accessKeyId: '1400101084', // 短信key
    secretAccessKey: '7c1e62752a6cd88719ef61cbf3b93ccb', // 短信key
    mapKey: 'KKJBZ-PPXA4-WDYUI-XF4IJ-XCIGF-UOFNQ',
    mapSig: 'YX2OOpoRyQPwAa48kmgEfhmiRL0hQYy'
  },
  express: {
    // 快递物流信息查询使用的是快递鸟接口，申请地址：http://www.kdniao.com/
    appid: '', // 对应快递鸟用户后台 用户ID
    appkey: '', // 对应快递鸟用户后台 API key
    request_url: 'http://api.kdniao.cc/Ebusiness/EbusinessOrderHandle.aspx'
  },
  image: {
    user: '/usr/local/image/user',
    ad: '/usr/local/image/ad',
    material: '/usr/local/image/material',
    notice: '/usr/local/image/notice',
    bill: '/usr/local/image/bill',
    materialDefault: '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',
    defaultUserAvatar: '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'
  }
};
