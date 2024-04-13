const { getSelectData, unGetSelectData } = require('../../utils');

const findAllDiscountCodesSelect = async ({
  limit = 50,
  sort = 'ctime',
  page = 1,
  filter,
  select,
  model,
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 };
  const documents = await model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();

  return documents;
};

const findAllDiscountCodesUnselect = async ({
  limit = 50,
  sort = 'ctime',
  page = 1,
  filter,
  unSelect,
  model,
}) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 };
  const documents = await model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(unGetSelectData(unSelect))
    .lean();

  return documents;
};

module.exports = {
  findAllDiscountCodesSelect,
  findAllDiscountCodesUnselect,
};
