const Base = require('./base.js');

module.exports = class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  async listAction() {
    const page = this.get('page') || 1;
    const size = this.get('size') || 10;
    const name = this.get('name') || '';
    const cateId = this.get('cateid') || '';
    let data = null;
    if (cateId === 'all') {
      data = await this.model('goods').alias('g').field(['g.id', 'g.name', 'g.goods_brief', 'g.retail_price', 'g.goods_number', 'g.is_delete', 'c.name AS c_name', 'g.category_id']).join({
        table: 'category',
        join: 'left',
        as: 'c',
        on: ['category_id', 'id']
      }).where({'g.name': ['like', `%${name}%`]}).order(['g.id DESC']).page(page, size).countSelect();
    } else {
      data = await this.model('goods').alias('g').field(['g.id', 'g.name', 'g.goods_brief', 'g.retail_price', 'g.goods_number', 'g.is_delete', 'c.name AS c_name', 'g.category_id']).join({
        table: 'category',
        join: 'left',
        as: 'c',
        on: ['category_id', 'id']
      }).where({'g.name': ['like', `%${name}%`], 'g.category_id': `${cateId}`}).order(['g.id DESC']).page(page, size).countSelect();
    }
    // const data = await model.where({name: ['like', `%${name}%`]}).order(['id DESC']).page(page, size).countSelect();
    return this.success(data);
  }

  async infoAction() {
    const id = this.get('id');
    const model = this.model('goods');
    const data = await model.where({id: id}).find();

    return this.success(data);
  }
  async delAction() {
    const id = this.post('id');
    await this.model('goods').where({id: id}).limit(1).delete();
    // TODO 删除图片

    return this.success();
  }
  async storeAction() {
    if (!this.isPost) {
      return false;
    }

    const values = this.post();
    const id = this.post('id');

    const model = this.model('goods');
    values.is_on_sale = values.is_on_sale ? 1 : 0;
    values.is_new = values.is_new ? 1 : 0;
    values.is_hot = values.is_hot ? 1 : 0;
    if (id > 0) {
      await model.where({id: id}).update(values);
    } else {
      delete values.id;
      await model.add(values);
    }
    return this.success(values);
  }

  async destoryAction() {
    const id = this.post('id');
    await this.model('goods').where({id: id}).limit(1).delete();
    // TODO 删除图片

    return this.success();
  }
};
