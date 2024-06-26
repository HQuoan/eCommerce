/* eslint-disable camelcase */
const { Types } = require('mongoose');
const { product, electronic, clothing } = require('../../models/product.model');
const { getSelectData, unGetSelectData } = require('../../utils');

const queryProduct = async ({ query, limit, skip }) =>
  await product
    .find(query)
    .populate('product_shop', 'name email -_id')
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();

const findAllDraftsForShop = async ({ query, limit, skip }) =>
  await queryProduct({ query, limit, skip });

const findAllPublishForShop = async ({ query, limit, skip }) =>
  await queryProduct({ query, limit, skip });

const searchProductByUser = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch);
  const results = await product
    .find(
      {
        isPublished: true,
        $text: { $search: regexSearch },
      },
      {
        score: { $meta: 'textScore' },
      },
    )
    .sort({ score: { $meta: 'textScore' } })
    .lean();

  return results;
};

const publishProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });

  if (!foundShop) return null;

  foundShop.isDraft = false;
  foundShop.isPublished = true;
  const { modifiedCount } = await foundShop.updateOne(foundShop);

  return modifiedCount;
};

const unPublicProductByShop = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });

  if (!foundShop) return null;

  foundShop.isDraft = true;
  foundShop.isPublished = false;
  const { modifiedCount } = await foundShop.updateOne(foundShop);

  return modifiedCount;
};

const findAllProducts = async ({ limit, sort, page, filter, select }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 };
  const products = await product
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();

  return products;
};

const findProduct = async ({ product_id, unSelect = {} }) =>
  await product.findById(product_id).select(unGetSelectData(unSelect));

const updateProductById = async ({
  productId,
  bodyUpdate,
  model,
  isNew = true,
}) =>
  await model.findByIdAndUpdate(productId, bodyUpdate, {
    new: isNew,
  });

const checkProductByServer = async (products) =>
  await Promise.all(
    products.map(async (productItem) => {
      const foundProduct = await findProduct({
        product_id: productItem.productId,
      });
      if (foundProduct) {
        return {
          price: foundProduct.product_price,
          quantity: productItem.quantity,
          productId: productItem.productId,
        };
      }
    }),
  );

module.exports = {
  findAllDraftsForShop,
  publishProductByShop,
  unPublicProductByShop,
  findAllPublishForShop,
  searchProductByUser,
  findAllProducts,
  findProduct,
  updateProductById,
  checkProductByServer,
};
