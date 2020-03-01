const Base = require('./base.js');

module.exports = class extends Base {
  async foodListAction() {
    const foodcate = this.model('foodcate');
    const foods = this.model('foods');
    const data = await foodcate.field(['id', 'name']).select();
    for (const item of data) {
      item.children = await foods.field(['id', 'foodcate_id', 'name', 'foods_number', 'list_pic_url', 'sell_volume', 'unit_price', 'promotion_tag']).where(`foodcate_id = ${item.id}`).select();
      item.children.forEach(ktem => {
        ktem.promotion_tag = ktem.promotion_tag.includes(',') ? ktem.promotion_tag.split(',') : [ktem.promotion_tag];
      });
    }
    return this.success(data);
  }

  async detailAction() {
    const model = this.model('brand');
    const data = await model.where({id: this.get('id')}).find();

    return this.success({brand: data});
  }
  async getconfigAction() {
    const link = this.get('url') || this.post('url');
    const WeixinConfig = this.service('wxsdk', 'api');
    const data = await WeixinConfig.getConfig(link);
    return this.success(data);
  }
};
