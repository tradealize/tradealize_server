const { user, message, conversation } = require("../models");
const { Op } = require("sequelize");

const findConversationById = async (conversation_id) => {
  let current = await conversation.findOne({
    where: {
      conversation_id,
    },
    include: [user],
  });
  if (current === null) return current;
  current = current.toJSON();
  let messages = await message.findAll({
    where: {
      conversation_id,
      content: {
        [Op.not]: null,
      },
    },
  });
  current.messages = messages.map((message) => message.toJSON());
  return current;
};

const createConversationFromData = async (data) => {
  delete data.conversation_id;
  const current_conversation = await conversation.create(data);
  return current_conversation.toJSON();
};

const deleteConversationById = async (conversation_id) => {
  return conversation.destroy({
    where: { conversation_id },
  });
};

module.exports = {
  findConversationById,
  createConversationFromData,
  deleteConversationById,
};
