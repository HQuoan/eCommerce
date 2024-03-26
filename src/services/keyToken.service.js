const { Types } = require('mongoose');
const keyTokenModel = require('../models/keyToken.model');

class KeyTokenService {
  static async createKeyToken({ userId, publicKey, privateKey, refreshToken }) {
    try {
      // level 0
      // const tokens = await keyTokenModel.create({
      //   user: userId,
      //   publicKey,
      //   privateKey,
      // });
      // return tokens ? tokens.publicKey : null;

      // level xxx
      const filter = { user: userId };
      const update = {
        publicKey,
        privateKey,
        refreshTokensUsed: [],
        refreshToken,
      };
      const options = { upsert: true, new: true };

      const tokens = await keyTokenModel.findOneAndUpdate(
        filter,
        update,
        options,
      );

      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  }

  static async findByUserId(userId) {
    return await keyTokenModel
      .findOne({ user: new Types.ObjectId(userId) })
      .lean();
  }

  // static async findByUserId(userId) {
  //   return await keyTokenModel.findOne({ use: userId }).lean();
  // }

  static async removeKeyById(id) {
    return await keyTokenModel.deleteOne(id);
  }
}

module.exports = KeyTokenService;
