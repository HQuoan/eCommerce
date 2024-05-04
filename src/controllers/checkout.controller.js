const CheckoutService = require('../services/checkout.service');
const { SuccessResponse } = require('../core/success.response');

class CheckoutController {
  async checkoutReview(req, res, next) {
    new SuccessResponse({
      message: 'checkoutReview success',
      metadata: await CheckoutService.checkoutReview(req.body),
    }).send(res);
  }
}

module.exports = new CheckoutController();
