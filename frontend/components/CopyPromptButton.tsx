import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { Prompt_Part } from '../../types';
import { makePrompt } from '../utils';
import { fetchFiles } from '../api/files';
import { fetchSnippets } from '../api/snippets';
import { useStore } from '../state';

interface CopyPromptButtonProps {
	promptParts?: Prompt_Part[];
	label?: string;
}

const CopyPromptButton: React.FC<CopyPromptButtonProps> = ({
	promptParts,
	label = 'Copy Prompt',
}) => {
	const [selectedProjectId, setFiles, setSnippets] = useStore((state) => [
		state.selectedProjectId,
		state.setFiles,
		state.setSnippets,
	]);
	if (!promptParts) {
		promptParts = useStore((state) => state.includedPromptParts);
	}
	const copyPromptToClipboard = async (
		e: React.MouseEvent<HTMLButtonElement>
	) => {
		e.preventDefault();
		e.stopPropagation();
		if (selectedProjectId) {
			// refresh parts
			await fetchFiles(selectedProjectId).then((promptParts) => {
				setFiles(promptParts);
			});
			await fetchSnippets(selectedProjectId).then((snippets) => {
				setSnippets(snippets);
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
