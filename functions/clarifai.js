const { uploadFileFromDisk } = require("../middleware/aws-bucket");
const {
  getImageCompletion,
  predictWorkflowTTA,
} = require("../middleware/clarifai");
const { createFileFromData } = require("../actions/files");
const moment = require("moment");
const fs = require("fs");
const { createMessageFromData } = require("../actions/messages");
const { sendEventRoom } = require("../middleware/socket");

const runProjectWorkflow = async (prompt, image_url, metadata) => {
  try {
    const { user_id, conversation_id } = metadata;

    const chatCompletion = await getImageCompletion(
      prompt,
      image_url,
      metadata
    );
    const { choices } = chatCompletion;
    const { content } = choices[0].message;

    console.log(content);

    createMessageFromData({
      content,
      user_id,
      conversation_id,
      role: "assistant",
    }).then((message) => {
      sendEventRoom(`user-${user_id}`, "message", message);
      sendEventRoom(`user-${user_id}`, "message_stream_end");
    });

    const response = await predictWorkflowTTA(content);
    const { outputs } = response.results[0];

    const imageFile = await uploadImageOutput(outputs);

    createMessageFromData({
      user_id,
      conversation_id,
      role: "assistant",
      file_id: imageFile.file_id,
    }).then((message) => {
      sendEventRoom(`user-${user_id}`, "message", message);
      sendEventRoom(`user-${user_id}`, "message_stream_end");
    });

    const audioFile = await uploadAudioOutput(outputs);

    createMessageFromData({
      user_id,
      conversation_id,
      role: "assistant",
      file_id: audioFile.file_id,
    }).then((message) => {
      sendEventRoom(`user-${user_id}`, "message", message);
      sendEventRoom(`user-${user_id}`, "message_stream_end");
    });
  } catch (error) {
    console.log(error);
  }
};

const uploadImageOutput = async (outputs) => {
  if (Array.isArray(outputs)) {
    const dalleOutput = outputs.find(({ model }) => model.name === "dall-e-3");

    if (dalleOutput && dalleOutput !== null) {
      const { image } = dalleOutput.data;
      const { base64 } = image;
      const fileName = `Image_${moment().utc().format("YYYY_MM_DD_HH:mm")}`;
      const fileType = "png";
      const filePath = `${__dirname}/${fileName}.${fileType}`;

      fs.writeFileSync(filePath, base64, {
        encoding: "base64",
      });

      const file = await createFileFromData({
        name: fileName,
        type: "png",
      });

      await uploadFileFromDisk(filePath, `${fileName}.${fileType}`);

      return file;
    }
  }
};

const uploadAudioOutput = async (outputs) => {
  if (Array.isArray(outputs)) {
    const ttsOutput = outputs.find(
      ({ model }) => model.name === "openai-tts-1"
    );

    if (ttsOutput && ttsOutput !== null) {
      const { audio } = ttsOutput.data;
      const { audio_format } = audio.audio_info;
      const { base64 } = audio;

      const fileName = `Audio_${moment().utc().format("YYYY_MM_DD_HH:mm")}`;
      const fileType = audio_format;
      const filePath = `${__dirname}/${fileName}.${fileType}`;

      fs.writeFileSync(filePath, base64);

      const file = await createFileFromData({
        name: fileName,
        type: "png",
      });

      await uploadFileFromDisk(filePath, `${fileName}.${fileType}`);

      return file;
    }
  }
};

module.exports = { uploadImageOutput, uploadAudioOutput, runProjectWorkflow };
