const Base = require('./base.js');

module.exports = class extends Base {
  async getConfigAction() {
    const link = this.get('url') || this.post('url');
    const WeixinConfig = this.service('wxsdk', 'api');
    const data = await WeixinConfig.getConfig(link);
    return this.success(data);
  }
};
