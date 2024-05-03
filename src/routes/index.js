const express = require('express');
const { apiKey, isPermission } = require('../auth/checkAuth');

const router = express.Router();

// check apiKey
router.use(apiKey);

// check permission
router.use(isPermission('0000'));

router.use('/v1/api/product', require('./product'));
router.use('/v1/api/cart', require('./cart'));
router.use('/v1/api/discount', require('./discount'));
router.use('/v1/api', require('./access'));

module.exports = router;
