const OpenAI = require("openai");
const fs = require("fs");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const API_URL = "https://api.openai.com/v1/chat/completions";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

const getFineTunes = async () => {
  return openai
    .listFineTunes()
    .then((res) => res.data.data)
    .catch((error) => {
      throw error;
    });
};

const getFiles = async () => {
  return openai
    .listFiles()
    .then((res) => res.data.data)
    .catch((error) => {
      throw error;
    });
};

const fineTune = async (training_file, model) => {
  return openai.createFineTune({ training_file, model }).catch((error) => {
    throw error;
  });
};

const getFineTune = async (fine_tune_id) => {
  return openai.retrieveFineTune(fine_tune_id).catch((error) => {
    throw error;
  });
};

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

const getChatResult = async (prompt, messages, options) => {
  const userMessage = { role: "user", content: prompt };
  if (!Array.isArray(messages)) {
    messages = [userMessage];
  } else {
    messages.push(userMessage);
  }
  let model = "gpt-4";
  if (options && options !== null) {
    if (options.model && options.model !== null) model = options.model;
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

const getChatOutputs = async (messages) => {
  return openai.chat.completions
    .create({
      model: "gpt-4",
      messages,
    })
    .catch((error) => {
      throw error;
    });
};

const getChatResultStream = async (prompt, messages, callback) => {
  const userMessage = { role: "user", content: prompt };
  if (!Array.isArray(messages)) {
    messages = [userMessage];
  } else {
    messages.push(userMessage);
  }
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPEN_AI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      stream: true,
      messages,
    }),
  });

  let prevString;

  for await (const chunk of response.body) {
    let currentString = chunk.toString();
    let originalString = currentString;

    currentString = currentString.replace("data: ", "");
    currentString = currentString.replace("\ndata: ", "");
    currentString = currentString.substring(0, currentString.length - 1);

    while (currentString.includes("\ndata: ")) {
      currentString = currentString.replace("\ndata: ", "");
    }

    if (currentString.includes("[DONE]")) {
      callback(null);
      break;
    }

    if (currentString.split('{"id":').length > 2) {
      let stringSplit = currentString.split('{"id":');
      let firstOutput = '{"id":' + stringSplit[1];
      let secondOutput = '{"id":' + stringSplit[2];
      try {
        firstOutput = JSON.parse(firstOutput);
        callback(firstOutput.choices[0].delta);
      } catch (error) {
        console.log("error on first output");
        console.log(originalString);
      }

      try {
        secondOutput = JSON.parse(secondOutput);
        callback(secondOutput.choices[0].delta);
      } catch (error) {
        console.log("error on second output");
        console.log(originalString);
      }
    } else {
      try {
        currentString = currentString.replace("\n", "");
        currentString = currentString.trim();
        currentString = JSON.parse(currentString);
        callback(currentString.choices[0].delta);
      } catch (error) {
        console.log("error on single output");
        console.log(currentString);
        if (prevString && prevString !== "") {
          if (String(currentString)[0] === ",") {
            currentString = String(prevString + '"').concat(currentString);
          } else {
            currentString = String(prevString).concat(currentString);
          }
          currentString = currentString.replace("\n", "");
          currentString = currentString.trim();
          try {
            currentString = JSON.parse(currentString);
            callback(currentString.choices[0].delta);
          } catch (error) {
            console.log("error concating string");
            console.log(currentString);
          }
          prevString = "";
        } else {
          prevString = currentString;
        }
      }
    }
  }

  console.log(prevString);
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

const createAssistantThread = async (message) => {
  const newThread = await openai.beta.threads.create({
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
  });

  return newThread;
};

const createOpenaiThreadMessage = async (threadId, message) => {
  const newThreadMessage = await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: message,
  });

  return newThreadMessage;
};

const getAssistant = async (assistant_id) => {
  const myAssistant = await openai.beta.assistants.retrieve(assistant_id);

  return myAssistant;
};

const getAssistantOutput = async (messages, assistant_id) => {
  const run = await openai.beta.threads.createAndRun({
    assistant_id,
    thread: {
      messages,
    },
  });

  const runStatus = await getThreadRunStatus(run.thread_id, run.id);

  return run;
};

const createThreadRun = async (threadId, assistantId) => {
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
  });

  const status = await getThreadRunStatus(threadId, run.id);
  return status;
};

const getThreadRunStatus = async (threadId, runId) => {
  let runData;
  let attempts = 0;

  await new Promise((resolve) => setTimeout(resolve, 3000));

  do {
    runData = await openai.beta.threads.runs.retrieve(threadId, runId);

    console.log(runData);
    attempts++;

    if (runData.status === "completed") {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
  } while (runData.status !== "completed" && attempts < 30);

  return runData.status;
};

const getOpenaiThreadMessages = async (threadId) => {
  const threadMessages = await openai.beta.threads.messages.list(threadId, {
    order: "asc",
    limit: 100,
  });

  return threadMessages;
};

const createOpenaiAssistant = async (name, context) => {
  const validContext = context?.length > 0 ? true : false;
  const assistantData = {
    name,
    model: "gpt-4-1106-preview",
    tools: [{ type: "retrieval" }],
    file_ids: [],
  };

  if (validContext) assistantData.instructions = context;
  const assistant = await openai.beta.assistants.create(assistantData);

  return assistant;
};

const addFileToAssistant = async (openai_file_id, assistant_id) => {
  try {
    const updatedAssistant = await openai.beta.assistants.files.create(
      assistant_id,
      {
        file_id: openai_file_id,
      }
    );

    return updatedAssistant;
  } catch (error) {
    throw error;
  }
};

const updateOpenaiAssistant = async (assistant_id, data) => {
  const updatedAssistant = await openai.beta.assistants.update(
    assistant_id,
    data
  );

  return updatedAssistant;
};

const deleteAssistantFile = async (openai_file_id, assistant_id) => {
  try {
    const assistantFileDeleted = await openai.beta.assistants.files.del(
      assistant_id,
      openai_file_id
    );

    const openaiFileDeleted = await openai.files.del(openai_file_id);
  } catch (error) {
    throw error;
  }
};

const deleteOpenaiThread = async (thread_id) => {
  const response = await openai.beta.threads.del(thread_id);
};

const deleteOpenaiFiles = async (openaiFiles) => {
  try {
    return Promise.all(
      openaiFiles.map(async (id) => {
        await openai.files.del(id);
      })
    );
  } catch (error) {
    throw error;
  }
};

const deleteAssistantById = async (assistantId) => {
  try {
    const assistantDeleted = await openai.beta.assistants.del(assistantId);
    return assistantDeleted;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getFiles,
  fineTune,
  getResult,
  uploadOpenaiFile,
  getFineTune,
  getFineTunes,
  getChatResult,
  getChatOutputs,
  getChatResultStream,
  uploadFileFromStream,
  uploadFileFromStreamCustomApiKey,
  getOpenaiThreadMessages,
  createOpenaiAssistant,
  createAssistantThread,
  createOpenaiThreadMessage,
  createThreadRun,
  addFileToAssistant,
  getAssistantOutput,
  getAssistant,
  updateOpenaiAssistant,
  deleteAssistantFile,
  deleteAssistantById,
  deleteOpenaiFiles,
  deleteOpenaiThread,
  getThreadRunStatus,
};
