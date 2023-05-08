import { Prompt_Part } from './types';

export const makePrompt = (includedPromptParts: Prompt_Part[]): string => {
	return includedPromptParts
		.map((part) => {
			let content = part.name + ':\n';
			if (part.use_summary) {
				content += part.summary;
			} else {
				content += part.content;
			}
			return content.trim();
		})
		.join('\n\n');
};

export const detectFileLanguage = (name: string) => {
	const extension = name.split('.').pop();
	switch (extension) {
		case 'js':
			return 'javascript';
		case 'ts':
			return 'typescript';
		case 'py':
			return 'python';
		case '':
			return 'markdown';
		default:
			return extension;
	}
};
