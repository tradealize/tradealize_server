const { createThreadMessage, createThreadRun, getThreadMessages, createAssistantThread } = require("../functions/openai");
const { user_thread } = require("../models");


//verificar si un usuario tiene o no un thread con un assistant
const userHasAssistantThread = async (userId, assistantId) => {
  const currentThread = await user_thread.findOne({
    where: {
      user_id: Number(userId),
      assistant_id: assistantId
    }
  });

  return currentThread;
}

const addMessageToThread = async (currentThread, userMessage, assistantId) => {
  const threadId = currentThread.thread_id;
  const newThreadMessage = await createThreadMessage(threadId, userMessage);
  const threadRunEstatus = await createThreadRun(threadId, assistantId);

  if(threadRunEstatus === 'completed') {
    const threadMessages = await getThreadMessages(threadId);
    return threadMessages;
  } 
}

const createThreadWithMessage = async (userId, assistantId, userMessage) => {
  const newThread = await createAssistantThread(userMessage);

  const newUserThread = await user_thread.create({
    user_id: Number(userId),
    thread_id: newThread.id,
    assistant_id: assistantId
  });

  const threadRunEstatus = await createThreadRun(newThread.id, assistantId);
  if(threadRunEstatus === 'completed') {
    const threadMessages = await getThreadMessages(newThread.id);
    return threadMessages;
  }
        
}

module.exports = {
  userHasAssistantThread,
  addMessageToThread,
  createThreadWithMessage,
}