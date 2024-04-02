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

  async publicProductByShop(req, res, next) {
    return new SuccessResponse({
      message: 'publicProductByShop success!',
      metadata: await ProductServiceV2.publishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  }

  async unPublicProductByShop(req, res, next) {
    return new SuccessResponse({
      message: 'unPublicProductByShop success!',
      metadata: await ProductServiceV2.unPublicProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  }

  /// QUERY //
  async getAllDraftsForShop(req, res, next) {
    return new SuccessResponse({
      message: 'Get list Draft success!',
      metadata: await ProductServiceV2.findAllDraftsForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  }

  async getAllPublishForShop(req, res, next) {
    return new SuccessResponse({
      message: 'Get list Publish success!',
      metadata: await ProductServiceV2.findAllPublishForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  }

  async getListSearchProduct(req, res, next) {
    return new SuccessResponse({
      message: 'Get list search product success!',
      metadata: await ProductServiceV2.searchProduct(req.params),
    }).send(res);
  }

  async findAllProducts(req, res, next) {
    return new SuccessResponse({
      message: 'Get list all products success!',
      metadata: await ProductServiceV2.findAllProducts(req.query),
    }).send(res);
  }

  async findProduct(req, res, next) {
    return new SuccessResponse({
      message: 'Get product success!',
      metadata: await ProductServiceV2.findProduct(req.params),
    }).send(res);
  }
}

module.exports = new ProductController();
