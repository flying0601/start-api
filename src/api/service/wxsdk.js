const fly = require('flyio');
const crypto = require('crypto');

module.exports = class extends think.Service {
  async getConfig(link) {
    const appid = think.config('wxWeb.appid');
    const secret = think.config('wxWeb.secret');
    const tokenObj = await think.cache('token') ? await think.cache('token') : await this.getToken(appid, secret);
    const ticketObj = await think.cache('ticket') ? await think.cache('ticket') : await this.getTicket(tokenObj);
    // 计算signature
    const getSign = await this.sign(ticketObj.ticket, link);
    const res = Object.assign({appId: think.config('wxWeb.appid')}, getSign);
    // const getticket = await rp(ticketOptions);
    return res;
  }
  async getToken(appid, appSecret) {
    // 获取access_token
    const tokenUrl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appid + '&secret=' + appSecret;
    const token = await fly.get(tokenUrl).then(res => {
      return res.data;
    }).catch(error => {
      this.fail(error);
    });
    // 设置缓存token
    await think.cache('token', token, {
      timeout: token.expires_in
    });
    // console.log({token});
    return token;
  }
  // 获取jsapi_ticket
  async getTicket(token) {
    const ticketUrl = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + token.access_token + '&type=jsapi';
    const jsapiTicket = await fly.get(ticketUrl).then(params => {
      if (params.data.errmsg === 'ok') {
        return params.data;
      }
    }).catch(error => {
      this.fail(error);
    });
    // 设置缓存jsapiTicket
    await think.cache('ticket', jsapiTicket, {
      timeout: jsapiTicket.expires_in
    });
    return jsapiTicket;
  }
  // 随机字符串
  createNonceStr() {
    return Math.random().toString(36).substr(2, 15);
  }

  // 时间戳
  createTimestamp() {
    return parseInt(new Date().getTime() / 1000) + '';
  }

  // 排序拼接
  raw(args) {
    var keys = Object.keys(args);
    keys = keys.sort();
    var newArgs = {};
    keys.forEach(function(key) {
      newArgs[key.toLowerCase()] = args[key];
    });
    var string = '';
    for (var k in newArgs) {
      string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
  }
  /**
  * @synopsis 签名算法
  *
  * @param jsapi_ticket 用于签名的 jsapi_ticket
  * @param link 用于签名的 link ，注意必须动态获取，不能 hardcode
  *
  * @returns
  */
  sign(jsapiTicket, link) {
    const ret = {
      jsapi_ticket: jsapiTicket,
      nonceStr: this.createNonceStr(),
      timestamp: this.createTimestamp(),
      url: link
    };
    const string = this.raw(ret);
    const shasum = crypto.createHash('sha1');
    shasum.update(string);
    const signature = shasum.digest('hex');
    ret.signature = signature;
    return ret;
  }
};
