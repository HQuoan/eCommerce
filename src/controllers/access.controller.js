const AccessService = require('../services/access.service');

const { OK, CREATED, SuccessResponse } = require('../core/success.response');

class AccessController {
  async handlerRefreshToken(req, res, next) {
    new SuccessResponse({
      message: 'Get token success!',
      metadata: await AccessService.handlerRefreshToken({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore,
      }),
    }).send(res);
  }

  async logout(req, res, next) {
    new SuccessResponse({
      message: 'Logout success!',
      metadata: await AccessService.logout(req.keyStore),
    }).send(res);
  }

  async login(req, res, next) {
    new SuccessResponse({
      metadata: await AccessService.login(req.body),
    }).send(res);
  }

  async signUp(req, res, next) {
    new CREATED({
      message: 'Registered OK!',
      metadata: await AccessService.signUp(req.body),
    }).send(res);
  }
}
module.exports = new AccessController();
