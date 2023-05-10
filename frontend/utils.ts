import { Prompt_Part } from './types';

export const makePrompt = (includedPromptParts: Prompt_Part[]): string => {
	return includedPromptParts
		.map((part) => {
			let content = '';
			if (part.use_title) content += part.name + ':\n';
			if (part.use_summary) {
				content += part.summary;
			} else {
				content += part.content;
			}
			return content.trim();
		})
		.join('\n\n');
};

export const detectFileLanguage = (
	prompPart: Prompt_Part,
	previewing: 'summary' | 'content' = 'content'
) => {
	const name = prompPart.name;
	let extension = name?.split('.').pop();
	if (
		!name.includes('.') ||
		extension === name ||
		prompPart.use_summary ||
		previewing === 'summary'
	)
		extension = '';
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
