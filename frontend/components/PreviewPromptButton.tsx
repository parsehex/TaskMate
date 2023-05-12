import React from 'react';
import { Tooltip } from 'react-tooltip';
import { Prompt_Part } from '../../types';
import { makePrompt } from '../utils';

interface PreviewButtonProps {
	promptParts: Prompt_Part[];
	setReadOnly: (readOnly: boolean) => void;
	setSelectedPromptPart: (promptPart: Prompt_Part | null) => void;
}

const PreviewPromptButton: React.FC<PreviewButtonProps> = ({
	promptParts,
	setReadOnly,
	setSelectedPromptPart,
}) => {
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
