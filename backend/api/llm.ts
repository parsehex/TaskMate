import { Project } from '../../shared/types/index.js';
import {
	ChatMessageHandlers,
	ProjectsMessageHandlers,
} from '../../shared/types/ws/index.js';
import { generateResponse } from '../openai/index.js';

async function MESSAGES_COMPLETION(prompt: string) {
	return await generateResponse(prompt);
}

const handlers: ChatMessageHandlers = {
	MESSAGES_COMPLETION,
};

export default handlers;
