/* eslint-disable camelcase */
const discount = require('../models/discount.model');
const { BadRequestError, NotFoundError } = require('../core/error.response');
const { findOne } = require('../models/discount.model');
const { convertToObjectIdMongoDb } = require('../utils');
const { findAllProducts } = require('../models/repositories/product.repo');
const {
  findAllDiscountCodesUnselect,
} = require('../models/repositories/discount.repo');
const discountModel = require('../models/discount.model');
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

  static async getAllProductWithDiscountCodes({
    code,
    shopId,
    userId,
    limit,
    page,
  }) {
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
        discountModel: true,
      },
      limit: +limit,
      page: +page,
      unSelect: ['__v', 'discount_shopId'],
      model: discount,
    });

    return discounts;
  }
}
