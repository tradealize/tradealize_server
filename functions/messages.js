const { getChatResult } = require("./openai");
const { sendEventRoom } = require("../middleware/socket");
const { createMessageFromData } = require("../actions/messages");
const { getImageCompletion } = require("../middleware/clarifai");
const { runProjectWorkflow } = require("./clarifai");

const formatMessages = (messages) => {
  return messages.map(({ role, content }) => ({ role, content })).slice(-2);
};

const handleChatOutput = async (conversation, prompt, messages, metadata) => {
  const { conversation_id } = conversation;
  const { user_id } = conversation.user;
  try {
    let chatCompletion;
    if (metadata.model === "gpt-4-vision") {
      return runProjectWorkflow(prompt, metadata.image_url, {
        conversation_id,
        user_id,
      });
    } else {
      chatCompletion = await getChatResult(prompt, messages, metadata);
    }

    const { usage, choices } = chatCompletion;
    choices.forEach((choice) => {
      const { content, role } = choice.message;
      createMessageFromData({
        role,
        content,
        user_id,
        conversation_id,
        used_tokens: usage.total_tokens,
        used_prompt_tokens: usage.prompt_tokens,
        used_completion_tokens: usage.completion_tokens,
      }).then((message) => {
        sendEventRoom(`user-${user_id}`, "message", message);
        sendEventRoom(`user-${user_id}`, "message_stream_end");
      });
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  formatMessages,
  handleChatOutput,
};
