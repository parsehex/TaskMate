import ChatHandlers from '../ws/llm';

export const sendPrompt = async (prompt: string) => {
  try {
    return await ChatHandlers.MESSAGES_COMPLETION(prompt);
  } catch (error) {
    console.error('Error running prompt:', error);
    return null;
  }
};
