import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Prompt_Part } from '@shared/types';
import { makePrompt } from '../utils';
import { useStore } from '../state';
import { fetchFiles } from '@/lib/api/files';
import { fetchSnippets } from '@/lib/api/snippets';

const PreviewPromptButton: React.FC = () => {
	const [
		includedPromptParts,
		setReadOnly,
		setSelectedPromptPart,
		selectedProjectId,
		setFiles,
		setSnippets,
	] = useStore((state) => [
		state.includedPromptParts,
		state.setReadOnly,
		state.setSelectedPromptPart,
		state.selectedProjectId,
		state.setFiles,
		state.setSnippets,
	]);
	const handlePreviewClick = async (e, refreshed = false) => {
		if (selectedProjectId && !refreshed) {
			// refresh parts
			Promise.all([
				fetchFiles(selectedProjectId),
				fetchSnippets(selectedProjectId),
			]).then(([promptParts, snippets]) => {
				setFiles(promptParts);
				setSnippets(snippets);
				handlePreviewClick(e, true);
			});
			return;
		}

		const previewContent = makePrompt(includedPromptParts);

		// do some basic checks to prevent previewing mistakenly large prompts
		if (previewContent.length > 500000) {
			console.log('Blocked preview');
			return;
		}
		const previewPromptPart = createPreviewPromptPart(previewContent);

		setReadOnly(true);
		setSelectedPromptPart(previewPromptPart);
	};

	return (
		<>
			<Button variant="secondary" size="xs" onClick={handlePreviewClick}>
				Preview
			</Button>
		</>
	);
};

const createPreviewPromptPart = (content: string) => {
	return {
		id: '-1',
		name: 'Prompt Preview',
		content,
		summary: '',
		included: false,
		project_id: '-1',
		use_summary: false,
		use_title: false,
	} as Prompt_Part;
};

export default PreviewPromptButton;
