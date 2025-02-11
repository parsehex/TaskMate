import React from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Prompt_Part } from '@shared/types';
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
	const [isLoading, setIsLoading] = React.useState(false);
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
		setIsLoading(true);
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
		setIsLoading(false);
	};

	return (
		<Button
			onClick={copyPromptToClipboard}
			disabled={isLoading}
			variant={label ? 'outline' : 'default'}
			size="xs"
		>
			{label !== '' ? label : <Copy />}
		</Button>
	);
};

export default CopyPromptButton;
