// import fs from 'fs';
// import https from 'https';
// const options = {
//   key: fs.readFileSync('/usr/local/nginx/ssl/2_huanjiaohu.com.key'),
//   cert: fs.readFileSync('/usr/local/nginx/ssl/1_huanjiaohu.com_bundle.crt')
// };
module.exports = {
  port: 8360,
  workers: 0,
  image: {
    user: '/usr/local/nginx/html/static/image/user',
    ad: '/usr/local/nginx/html/static/image/ad',
    material: '/usr/local/nginx/html/static/image/material',
    notice: '/usr/local/nginx/html/static/image/notice',
    bill: '/usr/local/nginx/html/static/bill',
    defaultUserAvatar: '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'
  }
};