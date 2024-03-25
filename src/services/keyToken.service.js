const keyTokenModel = require('../models/keyToken.model');

class KeyTokenService {
  static async createKeyToken({ userId, publicKey, privateKey }) {
    try {
      const tokens = await keyTokenModel.create({
        user: userId,
        publicKey,
        privateKey,
      });

      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  }
}

module.exports = KeyTokenService;
