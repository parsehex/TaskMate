import React from 'react';
import { Prompt_Part } from '../types';
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
		setReadOnly(true);

		const previewContent = makePrompt(promptParts);
		const previewPromptPart = createPreviewPromptPart(previewContent);

		setSelectedPromptPart(previewPromptPart);
	};

	return <button onClick={handlePreviewClick}>Preview</button>;
};

const createPreviewPromptPart = (content: string) => {
	return {
		id: -1,
		name: 'Prompt Preview',
		content: content,
		included: false,
		token_count: 0,
		project_id: -1,
	} as Prompt_Part;
};

export default PreviewPromptButton;
