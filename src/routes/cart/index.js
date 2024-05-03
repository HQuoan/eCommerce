const express = require('express');
const cartController = require('../../controllers/cart.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/authUtils');

const router = express.Router();

router.get('', asyncHandler(cartController.listToCart));
router.post('', asyncHandler(cartController.addToCart));
router.post('/update', asyncHandler(cartController.update));
router.delete('', asyncHandler(cartController.delete));

module.exports = router;
