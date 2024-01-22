const { file, message } = require("../models");

const findMessageById = async (message_id) => {
  const current = await message.findOne({
    where: {
      message_id,
    },
    include: {
      model: file,
      required: false,
    },
  });
  if (current === null) return current;
  return current.toJSON();
};

const findMessagesByParams = async (params, limit, offset) => {
  const messages = await message.findAll({
    limit,
    offset,
    where: params,
    include: {
      model: file,
      required: false,
    },
    order: [["createdAt", "DESC"]],
  });
  return messages.map((current) => current.toJSON());
};

const createMessageFromData = async (data) => {
  delete data.message_id;
  const current = await message.create(data);
  return findMessageById(current.message_id);
};

const updateMessageFromData = async (data) => {
  await message.update(data, { where: { message_id: data.message_id } });
  return findMessageById(data.message_id);
};

module.exports = {
  findMessageById,
  findMessagesByParams,
  createMessageFromData,
  updateMessageFromData,
};
