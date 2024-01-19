const {
  createMessageFromData,
  updateMessageFromData,
  findMessagesByParams,
} = require("../actions/messages");
const { handleChatOutput, formatMessages } = require("../functions/messages");
const { findConversationById } = require("../actions/conversations");
const { getOffset, PAGE_SIZE } = require("../constants");
const { findFileById } = require("../actions/files");
const { sequelize } = require("../models");

const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION;

const getMessages = async (req, res, next) => {
  try {
    const { user_id } = req;
    const { page } = req.query;
    const limit = PAGE_SIZE;
    const offset = getOffset(page);
    const params = {
      user_id,
    };
    const messages = await findMessagesByParams(params, {
      limit,
      offset,
    });
    const { max } = (
      await sequelize.query(
        `SELECT count(message_id) AS max
        FROM message 
        WHERE user_id = :user_id;`,
        {
          replacements: {
            user_id,
          },
        }
      )
    )[0][0];
    res.status(200).send({ messages, max });
  } catch (error) {
    next(error);
  }
};

const getConversationMessages = async (req, res, next) => {
  try {
    const { page } = req.query;
    const limit = PAGE_SIZE;
    const offset = getOffset(page);
    const { conversation_id } = req.params;
    const params = {
      conversation_id,
    };
    const messages = await findMessagesByParams(params, limit, offset);
    const { max } = (
      await sequelize.query(
        `SELECT count(message_id) AS max
        FROM message 
        WHERE conversation_id = :conversation_id`,
        { replacements: { conversation_id } }
      )
    )[0][0];
    res.status(200).send({ messages, max });
  } catch (error) {
    next(error);
  }
};

const createMessage = async (req, res, next) => {
  try {
    const { user_id, user } = req;
    let { file_id, content, enhance, conversation_id, message_type_id } =
      req.body;

    const used_prompt_tokens = Math.floor(String(content).length / 4);
    let currentMessage;

    let conversation;
    if (conversation_id && conversation_id !== null) {
      conversation = await findConversationById(conversation_id);
    } else {
      conversation = { messages: [], user };
    }
    if (isNaN(parseInt(message_type_id))) {
      message_type_id = null;
    }
    if (isNaN(parseInt(conversation_id))) {
      conversation_id = null;
    }
    currentMessage = await createMessageFromData({
      file_id: file_id && file_id !== null ? file_id : null,
      user_id: user.user_id,
      used_prompt_tokens,
      message_type_id,
      conversation_id,
      role: "user",
      content,
    });
    const messages = formatMessages(conversation.messages);
    const metadata = {
      message_type_id,
      user_id,
      enhance,
    };
    if (file_id && file_id !== null) {
      let currentFile = await findFileById(file_id);
      if (currentFile !== null) {
        let image_url = `https://${AWS_BUCKET_NAME}.s3.${AWS_BUCKET_REGION}.amazonaws.com/${currentFile.name}.${currentFile.type}`;
        metadata.image_url = image_url;
        metadata.model = "gpt-4-vision";
      }
    }
    handleChatOutput(conversation, content, messages, metadata);

    res.status(200).send({ message: currentMessage });
  } catch (error) {
    next(error);
  }
};

const updateMessage = async (req, res, next) => {
  try {
    const { message_id, content, favorite } = req.body;
    let current_message = await updateMessageFromData({
      message_id,
      content,
      favorite,
    });
    if (current_message.used_words === null) {
      const used_words = String(content).split(" ").length;
      await updateMessageFromData({ message_id, used_words });
    }
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversationMessages,
  createMessage,
  updateMessage,
  getMessages,
};
