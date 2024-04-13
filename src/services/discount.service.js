/* eslint-disable camelcase */
const discount = require('../models/discount.model');
const { BadRequestError, NotFoundError } = require('../core/error.response');
const { convertToObjectIdMongoDb } = require('../utils');
const { findAllProducts } = require('../models/repositories/product.repo');
const {
  findAllDiscountCodesUnselect,
  checkDiscountExists,
} = require('../models/repositories/discount.repo');
/*
  Discount services
  1 - Generator Discount code [Shop | Admin]
  2 - Get discount amount [User]
  3 - Get all discount codes [User | Shop]
  4 - Verify discount code [User]
  5 - Delete discount code [Admin | Shop]
  6 - Cancel discount code [User]
*/

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shopId,
      min_order_value,
      product_ids,
      applies_to,
      name,
      description,
      type,
      value,
      users_used,
      max_value,
      max_uses,
      used_count,
      max_uses_per_user,
    } = payload;

    // Kiem tra
    if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
      throw new BadRequestError('Discount code has expired');
    }

    if (new Date(start_date) >= new Date(end_date)) {
      throw new BadRequestError('Start date must be before end date');
    }

    // create index for discount code
    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongoDb(shopId),
      })
      .lean();

    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError('Discount exist');
    }

    const newDiscount = await discount.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_code: code,
      discount_value: value,
      discount_min_order_value: min_order_value || 0,
      discount_max_value: max_value,
      discount_start_date: start_date,
      discount_end_date: end_date,
      discount_max_uses: max_uses,
      discount_used_count: used_count,
      discount_users_used: users_used,
      discount_shopId: shopId,
      discount_max_uses_per_user: max_uses_per_user,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === 'all' ? [] : product_ids,
    });

    return newDiscount;
  }

  static async updateDiscount() {
    //..
  }

  /*
    Get all discount codes available with products
  */

  static async getAllProductWithDiscountCodes({ code, shopId, limit, page }) {
    const foundDiscount = await discount
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongoDb(shopId),
      })
      .lean();

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError('Discount not exist!');
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;
    let products;
    if (discount_applies_to === 'all') {
      // get all product
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectIdMongoDb(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name'],
      });
    }

    if (discount_applies_to === 'specific') {
      // get all product
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          product_shop: convertToObjectIdMongoDb(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: 'ctime',
        select: ['product_name'],
      });
    }

    return products;
  }

  /*
    get all discounts code of shop
  */
  static async getAllDiscountCodesByShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountCodesUnselect({
      filter: {
        discount_shopId: convertToObjectIdMongoDb(shopId),
        discount_is_active: true,
      },
      limit: +limit,
      page: +page,
      unSelect: ['__v', 'discount_shopId'],
      model: discount,
    });

    return discounts;
  }

  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExists({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongoDb(shopId),
      },
    });

    if (!foundDiscount) throw new NotFoundError(`Discount doesn't exists! `);

    const {
      discount_is_active,
      discount_max_uses,
      discount_min_order_value,
      discount_start_date,
      discount_end_date,
      discount_max_uses_per_user,
      discount_users_used,
      discount_type,
      discount_value,
      discount_max_value,
    } = foundDiscount;

    if (!discount_is_active) throw new NotFoundError('Discount expired!');
    if (!discount_max_uses) throw new NotFoundError('Discount are out!');

    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    ) {
      throw new BadRequestError('Discount code has expired');
    }

    // check gia tri toi thieu don hang
    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      // get total
      totalOrder = products.reduce(
        (acc, product) => acc + product.quantity * product.price,
        0,
      );

      if (totalOrder < discount_min_order_value)
        throw new NotFoundError(
          `Discount require a minimum order value of ${discount_min_order_value}`,
        );

      if (discount_max_uses_per_user > 0) {
        const userUseDiscount = discount_users_used.filter(
          (user) => user.userId === userId,
        );
        if (userUseDiscount.length > discount_max_uses_per_user)
          throw new NotFoundError(
            `exceed the amount used: ${discount_max_uses_per_user}`,
          );
      }

      // check discount nay la fixed_amount
      let amount =
        discount_type === 'fixed_amount'
          ? discount_value
          : totalOrder * (discount_value / 100);

      // check discount max value
      amount = amount < discount_max_value ? amount : discount_max_value;

      return {
        totalOrder,
        discount: amount,
        totalPrice: totalOrder - amount,
      };
    }
  }

  static async deleteDiscountCode({ shopId, codeId }) {
    const deleted = await discount.findByIdAndDelete({
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongoDb(shopId),
    });

    return deleted;
  }

  /* Cancel Discount Code [User] */
  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await checkDiscountExists({
      model: discount,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongoDb(shopId),
      },
    });

    if (!foundDiscount) throw new NotFoundError(`Discount doesn't exists! `);

    const result = await discount.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_max_uses: 1,
        discount_used_count: -1,
      },
    });

    return result;
  }
}

module.exports = DiscountService;
