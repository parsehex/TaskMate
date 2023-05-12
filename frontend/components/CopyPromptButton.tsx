import React from 'react';
import { Prompt_Part } from '../../types';
import { makePrompt } from '../utils';
import { fetchPromptParts } from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

interface CopyPromptButtonProps {
	promptParts: Prompt_Part[];
	selectedProjectId: number | null;
	setPromptParts: (promptParts: Prompt_Part[]) => void;
	label?: string;
}

const CopyPromptButton: React.FC<CopyPromptButtonProps> = ({
	promptParts,
	selectedProjectId,
	setPromptParts,
	label = 'Copy Prompt',
}) => {
	const copyPromptToClipboard = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		e.stopPropagation();
		if (selectedProjectId) {
			// refresh parts
			fetchPromptParts(selectedProjectId).then((promptParts) => {
				setPromptParts(promptParts);
			});
		}

		const prompt = makePrompt(promptParts);
		if (!navigator.clipboard) {
			try {
				// make a hidden span with the prompt text
				const hiddenSpan = document.createElement('span');
				hiddenSpan.textContent = prompt;
				hiddenSpan.style.display = 'none';
				document.body.appendChild(hiddenSpan);
				// highlight the text
				const range = document.createRange();
				range.selectNode(hiddenSpan);
				window.getSelection()?.removeAllRanges();
				window.getSelection()?.addRange(range);
				document.execCommand('copy');
				document.body.removeChild(hiddenSpan);
				console.log('Fallback: Copying to clipboard was hopefully successful!');
			} catch (err) {
				console.error('Fallback: Oops, unable to copy', err);
			}
		} else {
			navigator.clipboard.writeText(prompt).then(
				function () {
					console.log('Async: Copying to clipboard was successful!');
				},
				function (err) {
					console.error('Async: Could not copy text: ', err);
				}
			);
		}
	};

	return (
		<button onClick={copyPromptToClipboard}>
			{label !== '' ? label : ''}
			{label === '' ? <FontAwesomeIcon icon={faCopy} /> : ''}
		</button>
	);
};

export default CopyPromptButton;
