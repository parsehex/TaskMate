import { Prompt_Part } from './types';

export const makePrompt = (includedPromptParts: Prompt_Part[]): string => {
	return includedPromptParts
		.map((part) => part.name + ':\n' + part.content.trim())
		.join('\n\n');
};
