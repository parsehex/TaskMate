import { Project } from '../../shared/types/index.js';
import { ChatMessageHadlers, ProjectsMessageHandlers } from '../../shared/types/ws/index.js';
import { generateResponse } from '../openai/index.js';

async function MESSAGES_COMPLETION(prompt: string) {
	return await generateResponse(prompt);
}

const handlers: ChatMessageHadlers = {
	MESSAGES_COMPLETION,
};

export default handlers;
