const OpenAI = require("openai");
const fs = require("fs");

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

const uploadOpenaiFile = async (filePath) => {
  return openai.files
    .create({
      file: fs.createReadStream(filePath),
      purpose: "assistants",
    })
    .then((res) => {
      fs.unlinkSync(filePath);
      return res;
    })
    .catch((error) => {
      fs.unlinkSync(filePath);
      throw error;
    });
};

const uploadFileFromStream = async (readStream) => {
  return openai.createFile(readStream, "fine-tune").catch((error) => {
    throw error;
  });
};

const uploadFileFromStreamCustomApiKey = async (apiKey, readStream) => {
  const configuration = new Configuration({
    apiKey,
  });
  const openai = new OpenAIApi(configuration);
  return openai.createFile(readStream, "fine-tune").catch((error) => {
    throw error;
  });
};

const getChatResultCustomApiKey = async (
  apiKey,
  prompt,
  { max_tokens, messages }
) => {
  const configuration = new Configuration({
    apiKey,
  });
  const openai = new OpenAIApi(configuration);
  const userMessage = { role: "user", content: `${prompt} ###` };
  if (!Array.isArray(messages)) {
    messages = [userMessage];
  } else {
    messages.push(userMessage);
  }
  return openai.chat.completions
    .create({
      model: "gpt-4",
      stop: "###",
      max_tokens,
      messages,
    })
    .catch((error) => {
      throw error;
    });
};

const getChatResult = async (prompt, messages, metadata) => {
  const model = metadata.model ? metadata.model : "gpt-4";
  const userMessage = { role: "user", content: prompt };
  if (!Array.isArray(messages)) {
    messages = [userMessage];
  } else {
    messages.push(userMessage);
  }
  return openai.chat.completions
    .create({
      model,
      messages,
    })
    .catch((error) => {
      throw error;
    });
};

const getResult = async (prompt, model, { max_tokens, temperature }) => {
  return openai
    .createCompletion({
      model,
      prompt: `
              ${prompt}
              ###
            `,
      max_tokens,
      temperature,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      stop: "###",
    })
    .catch((error) => {
      throw error;
    });
};

module.exports = {
  getResult,
  getChatResult,
  uploadOpenaiFile,
  uploadFileFromStream,
  getChatResultCustomApiKey,
  uploadFileFromStreamCustomApiKey,
};
