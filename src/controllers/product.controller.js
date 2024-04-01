const { SuccessResponse } = require('../core/success.response');
// const ProductService = require('../services/product.service');
const ProductServiceV2 = require('../services/product.service.xxx');

class ProductController {
  async createProduct(req, res, next) {
    return new SuccessResponse({
      message: 'Create new Product success!',
      metadata: await ProductServiceV2.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  }
}

module.exports = new ProductController();
