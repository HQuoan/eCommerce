const AccessService = require('../services/access.service');

const { OK, CREATED } = require('../core/success.response');

class AccessController {
  async signUp(req, res, next) {
    new CREATED({
      message: 'Registered OK!',
      metadata: await AccessService.signUp(req.body),
    }).send(res);
  }
}
module.exports = new AccessController();
