const ProductService = require('../services/product.service');
const { SuccessResponse } = require('../core/success.response');

class ProductController {
  async createProduct(req, res, next) {
    return new SuccessResponse({
      message: 'Create new Product success!',
      metadata: await ProductService.createProduct(
        req.body.product_type,
        req.body,
      ),
    }).send(res);
  }
}

module.exports = new ProductController();
