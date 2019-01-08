module.exports = class extends think.Service {
  async getChildCategoryId(parentId) {
    const childIds = await this.model('mall_category').where({parent_id: parentId}).getField('id', 10000);
    return childIds;
  }

  async getCategoryWhereIn(categoryId) {
    const childIds = await this.model('mall_category').where({parent_id: categoryId}).getField('id', 10000);
    childIds.push(categoryId);
    return childIds;
  }
};
