// eslint-disable-next-line import/no-extraneous-dependencies
const _ = require('lodash');

const getInfoData = ({ fields = [], object = {} }) => _.pick(object, fields);

module.exports = {
  getInfoData,
};
