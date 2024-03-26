/* eslint-disable import/no-extraneous-dependencies */
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const shopModel = require('../models/shop.model');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair, verifyJWT } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { BadRequestError, AuthFailureError } = require('../core/error.response');
const { findByEmail } = require('./shop.service');

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN',
};

class AccessService {
  static async handlerRefreshToken(refreshToken) {
    const foundToken =
      await KeyTokenService.findByRefreshTokenUsed(refreshToken);

    if (foundToken) {
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey,
      );
      console.log({ userId, email });

      //xoa tat ca token trong keyStore
      await KeyTokenService.deleteKeyById(userId);
      throw new BadRequestError('Something wrong happened!! Please relogin');
    }

    // No , Ok
    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);

    if (!holderToken) throw new AuthFailureError('Shop not registered');

    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey,
    );
    console.log('2----', { userId, email });
    // check userId
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new AuthFailureError('Shop not registered');

    /// create 1 cap token moi
    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey,
    );

    // update token
    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken, // da duoc dung de tao token moi roi
      },
    });

    return {
      user: { userId, email },
      tokens,
    };
  }

  static async logout(keyStore) {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    console.log({ delKey });
    return delKey;
  }

  static async login({ email, password, refreshToken = null }) {
    // 1 - check email in dbs
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestError('Shop no registered');

    // 2 - match password
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError('Authentication error');

    // 3 - create AT vs RT and save
    // created privateKey, publicKey
    const privateKey = crypto.randomBytes(64).toString('hex');
    const publicKey = crypto.randomBytes(64).toString('hex');

    // 4 - generate tokens
    const { _id: userId } = foundShop;
    const tokens = await createTokenPair(
      { userId, email },
      publicKey,
      privateKey,
    );

    await KeyTokenService.createKeyToken({
      userId,
      privateKey,
      publicKey,
      refreshToken: tokens.refreshToken,
    });

    return {
      shop: getInfoData({
        fields: ['_id', 'name', 'email'],
        object: foundShop,
      }),
      tokens,
    };
  }

  static async signUp({ name, email, password }) {
    // try {
    // Step1: check email exists??

    const holderShop = await shopModel.findOne({ email }).lean();

    if (holderShop) {
      throw new BadRequestError('Error: Shop already registered!');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      // created privateKey, publicKey
      const privateKey = crypto.randomBytes(64).toString('hex');
      const publicKey = crypto.randomBytes(64).toString('hex');

      console.log({ privateKey, publicKey });

      // save publicKey in db
      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        return {
          code: 'xxxx',
          message: 'keyStore error',
        };
      }

      // created token pair
      const tokens = await createTokenPair(
        { userId: newShop._id, email },
        publicKey,
        privateKey,
      );

      console.log(`Created Token Success:: `, tokens);

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fields: ['_id', 'name', 'email'],
            object: newShop,
          }),
          tokens,
        },
      };
    }

    return {
      code: 200,
      metadata: null,
    };
  }
}

module.exports = AccessService;
