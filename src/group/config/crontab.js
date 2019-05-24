module.exports = [ {
  cron: '0 * * * *',
  immediate: false,
  enable: false,
  handle: 'http://127.0.0.1:8360/group/group/checkSupplierDelivery'
},
{
  cron: '0 * * * *',
  immediate: false,
  enable: false,
  handle: 'http://127.0.0.1:8360/group/group/checkSupplierConfirm'
}];
