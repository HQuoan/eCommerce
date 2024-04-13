const express = require('express');
const discountController = require('../../controllers/discount.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/authUtils');

const router = express.Router();

/// get amount a discount
router.post('/amount', asyncHandler(discountController.getDiscountAmount));
router.post(
  '/list_product_code',
  asyncHandler(discountController.getAllProductsWithDiscountCode),
);

// authentication
router.use(authentication);
///////////////////////

router.get('', asyncHandler(discountController.getAllDiscountCodes));
router.post('', asyncHandler(discountController.createDiscountCode));

module.exports = router;
