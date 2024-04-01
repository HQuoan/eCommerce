const express = require('express');
const { apiKey, isPermission } = require('../auth/checkAuth');

const router = express.Router();

// check apiKey
router.use(apiKey);

// check permission
router.use(isPermission('0000'));

router.use('/v1/api', require('./access'));
router.use('/v1/api/product', require('./product'));

module.exports = router;
