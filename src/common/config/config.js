// default config
module.exports = {
  default_module: 'api',
  weixin: {
    appid: 'wx8e0c3dad2e14eec1', // 小程序 appid
    secret: 'ca05f17cc0be46e4958e32a8038f6655', // 小程序密钥
    mch_id: '1556146791', // 商户帐号ID
    partner_key: 'Youlinfei350783199406185018fly06', // 微信支付密钥
    notify_url: 'https://minapp.actfou.com/api/pay/notify' // 微信异步通知，例：https://www.nideshop.com/api/pay/notify
  },
  express: {
    // 快递物流信息查询使用的是快递鸟接口，申请地址：http://www.kdniao.com/
    appid: '', // 对应快递鸟用户后台 用户ID
    appkey: '', // 对应快递鸟用户后台 API key
    request_url: 'http://api.kdniao.cc/Ebusiness/EbusinessOrderHandle.aspx'
  }
};
