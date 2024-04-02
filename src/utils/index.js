// eslint-disable-next-line import/no-extraneous-dependencies
const _ = require('lodash');

const getInfoData = ({ fields = [], object = {} }) => _.pick(object, fields);

//  ['a', 'b'] => {a: 1, b: 1}
const getSelectData = (select = []) =>
  Object.fromEntries(select.map((el) => [el, 1]));

//  ['a', 'b'] => {a: 0, b: 0}
const unGetSelectData = (select = []) =>
  Object.fromEntries(select.map((el) => [el, 0]));

module.exports = {
  getInfoData,
  getSelectData,
  unGetSelectData,
};
