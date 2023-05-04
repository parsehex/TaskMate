import React from 'react';
import { Prompt_Part } from '../types';
import { makePrompt } from '../utils';
import { fetchPromptParts } from '../api';

interface CopyPromptButtonProps {
	promptParts: Prompt_Part[];
	selectedProjectId: number | null;
	setPromptParts: (promptParts: Prompt_Part[]) => void;
}

const CopyPromptButton: React.FC<CopyPromptButtonProps> = ({
	promptParts,
	selectedProjectId,
	setPromptParts,
}) => {
	const copyPromptToClipboard = () => {
		if (selectedProjectId) {
			fetchPromptParts(selectedProjectId).then((promptParts) => {
				setPromptParts(promptParts);
			});
		}

		const prompt = makePrompt(promptParts);
		navigator.clipboard.writeText(prompt);
	};

	return <button onClick={copyPromptToClipboard}>Copy Prompt</button>;
};

export default CopyPromptButton;
