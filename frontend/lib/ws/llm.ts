import { ChatMessageHandlers } from '@shared/types/ws';
import { call } from '.';

async function MESSAGES_COMPLETION(prompt: string) {
	return (await call('MESSAGES_COMPLETION', [prompt])) as string;
}

const FilesHandlers: ChatMessageHandlers = {
	MESSAGES_COMPLETION,
};

export default FilesHandlers;
