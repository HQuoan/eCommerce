const CartService = require('../services/cart.service');
const { SuccessResponse } = require('../core/success.response');

class CartController {
  async addToCart(req, res, next) {
    new SuccessResponse({
      message: 'Create new Cart success',
      metadata: await CartService.addToCart(req.body),
    }).send(res);
  }

  // update + -
  async update(req, res, next) {
    new SuccessResponse({
      message: 'Update Cart success',
      metadata: await CartService.addToCart(req.body),
    }).send(res);
  }

  async delete(req, res, next) {
    new SuccessResponse({
      message: 'Deleted Cart success',
      metadata: await CartService.deleteUserCart(req.body),
    }).send(res);
  }

  async listToCart(req, res, next) {
    new SuccessResponse({
      message: 'List Cart success',
      metadata: await CartService.getListUserCart(req.body),
    }).send(res);
  }
}

module.exports = new CartController();
