import { Prompt_Part, isFile } from '../shared/types';

export const makePrompt = (includedPromptParts?: Prompt_Part[]): string => {
	if (!includedPromptParts) return '';
	return (
		includedPromptParts
			.map((part) => {
				let content = '';

			const shouldWrapCode = isFile(part) || part.use_title;
			if (part.use_title) {
				content += part.name;
				if (part.use_summary) content += ' (summary)';
				content += ':\n';
			}
			if (part.use_summary) {
				content += part.summary;
			} else {
				const partContent = part.content?.trim();
				content += shouldWrapCode
					? `\`\`\`\n${partContent}\n\`\`\``
					: partContent;
			}
			return content;
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
