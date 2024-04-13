const DiscountService = require('../services/discount.service');
const { SuccessResponse } = require('../core/success.response');

class DiscountController {
  async createDiscountCode(req, res, next) {
    return new SuccessResponse({
      message: 'Created code successfully!',
      metadata: await DiscountService.createDiscountCode({
        ...req.body,
        shopId: req.user.userId,
      }),
    }).send(res);
  }

  async getAllDiscountCodes(req, res, next) {
    return new SuccessResponse({
      message: 'List all discount codes by shop',
      metadata: await DiscountService.getAllDiscountCodesByShop({
        ...req.query,
        shopId: req.user.userId,
      }),
    }).send(res);
  }

  async getDiscountAmount(req, res, next) {
    return new SuccessResponse({
      message: 'Get discount amount successfully!',
      metadata: await DiscountService.getDiscountAmount({
        ...req.body,
      }),
    }).send(res);
  }

  async getAllProductsWithDiscountCode(req, res, next) {
    return new SuccessResponse({
      message: 'List all products with this discount code',
      metadata: await DiscountService.getAllProductWithDiscountCodes({
        ...req.query,
      }),
    }).send(res);
  }
}

module.exports = new DiscountController();
