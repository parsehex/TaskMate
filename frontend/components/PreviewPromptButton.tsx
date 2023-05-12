import React from 'react';
import { Prompt_Part } from '../../types';
import { makePrompt } from '../utils';
import { useStore } from '../state';

const PreviewPromptButton: React.FC = () => {
	const [promptParts, setReadOnly, setSelectedPromptPart] = useStore(
		(state) => [
			state.promptParts,
			state.setReadOnly,
			state.setSelectedPromptPart,
		]
	);
	const handlePreviewClick = () => {
		const previewContent = makePrompt(promptParts);

		// do some basic checks to prevent previewing mistakenly large prompts
		if (previewContent.length > 10000) {
			console.log('Blocked preview');
			return;
		}
		const previewPromptPart = createPreviewPromptPart(previewContent);

		setReadOnly(true);
		setSelectedPromptPart(previewPromptPart);
	};

	return (
		<>
			<button
				data-tooltip-id="previewButton"
				data-tooltip-html={promptParts
					.map((part) => '- ' + part.name)
					.join('<br>')}
				data-tooltip-delay-show={0}
				data-data-tooltip-place="bottom"
				onClick={handlePreviewClick}
			>
				Preview
			</button>
		</>
	);
};

const createPreviewPromptPart = (content: string) => {
	return {
		id: -1,
		name: 'Prompt Preview',
		content,
		summary: '',
		included: false,
		project_id: -1,
		use_summary: false,
		use_title: false,
	} as Prompt_Part;
};

export default PreviewPromptButton;
