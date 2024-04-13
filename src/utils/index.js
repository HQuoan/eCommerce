// eslint-disable-next-line import/no-extraneous-dependencies
const _ = require('lodash');
const { Types } = require('mongoose');

const convertToObjectIdMongoDb = (id) => Types.ObjectId(id);

const getInfoData = ({ fields = [], object = {} }) => _.pick(object, fields);

//  ['a', 'b'] => {a: 1, b: 1}
const getSelectData = (select = []) =>
  Object.fromEntries(select.map((el) => [el, 1]));

//  ['a', 'b'] => {a: 0, b: 0}
const unGetSelectData = (select = []) =>
  Object.fromEntries(select.map((el) => [el, 0]));

const removeUndefinedObject = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] == null) delete obj[key];
  });
  return obj;
};

const updateNestedObjectParser = (obj) => {
  const final = {};
  Object.keys(obj).forEach((k) => {
    // eslint-disable-next-line valid-typeof
    if (typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      const response = updateNestedObjectParser(obj[k]);
      Object.keys(response).forEach((a) => {
        final[`${k}.${a}`] = response[a];
      });
    } else {
      final[k] = obj[k];
    }
  });

  return final;
};

module.exports = {
  getInfoData,
  getSelectData,
  unGetSelectData,
  removeUndefinedObject,
  updateNestedObjectParser,
  convertToObjectIdMongoDb,
};
