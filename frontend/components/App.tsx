import React, { useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { fetchProjects } from '../api/projects';
import { useStore } from '../state';
import { makePrompt } from '../utils';
import CopyPromptButton from './CopyPromptButton';
import Editor from './Editor';
import ProjectSelector from './ProjectSelector';
import PromptPartsList from './PromptPartsList';
import PreviewPromptButton from './PreviewPromptButton';
import TokenCountDisplay from './TokenCountDisplay';
import { fetchSnippets } from '../api/snippets';
import { fetchFiles } from '../api/files';
import { getTokenCount } from '../api/utils';

export const App: React.FC = () => {
	const {
		selectedProjectId,
		snippets,
		files,
		selectedPromptPart,
		includedPromptParts,
		promptTokenCount,

		setProjects,
		setFiles,
		setSnippets,
		setSelectedPromptPart,
		setSelectedProjectId,
		setPromptTokenCount,
		setIncludedPromptParts,
		setReadOnly,
	} = useStore((state) => state);

	useEffect(() => {
		fetchProjects().then((projects) => {
			const sortedProjects = projects.sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			setProjects(sortedProjects);
		});

		const selectedProjectId = localStorage.getItem('selectedProjectId');
		if (selectedProjectId) {
			setSelectedProjectId(Number(selectedProjectId));
		}
	}, []);

	useEffect(() => {
		if (selectedProjectId !== null && Number.isInteger(selectedProjectId)) {
			fetchSnippets(selectedProjectId).then((newSnippets) => {
				setSnippets(newSnippets);
			});
			fetchFiles(selectedProjectId).then((newFiles) => {
				setFiles(newFiles);
			});
		}
		if (selectedPromptPart?.id !== -1) {
			setReadOnly(false);
		}
	}, [selectedProjectId]);

	useEffect(() => {
		if (selectedPromptPart?.id !== -1) {
			setReadOnly(false);
		}
	}, [selectedPromptPart]);

	useEffect(() => {
		const text = makePrompt(includedPromptParts);
		getTokenCount({ text }).then((data) => {
			setPromptTokenCount(data.token_count);
		});
	}, [includedPromptParts]);

	const updateIncludedPromptParts = () => {
		let includedPromptParts: any[] = [];
		if (snippets.length > 0) {
			const arr = snippets.filter((part) => part.included);
			includedPromptParts = includedPromptParts.concat(arr);
		}
		if (files.length > 0) {
			const arr = files.filter((part) => part.included);
			includedPromptParts = includedPromptParts.concat(arr);
		}
		setIncludedPromptParts(includedPromptParts);
	};

	useEffect(() => {
		updateIncludedPromptParts();
		if (selectedPromptPart?.id !== -1) {
			setReadOnly(false);
		}
	}, [snippets, files]);

	return (
		<div className="app">
			<main>
				<div className="left-sidebar">
					<ProjectSelector />
					<div className="prompt-options">
						<CopyPromptButton />
						<PreviewPromptButton />
						<TokenCountDisplay tokenCount={promptTokenCount} /> /{' '}
						{includedPromptParts.length} parts
					</div>
					<PromptPartsList />
				</div>
				<div className="right-sidebar">
					{selectedPromptPart && (
						<button
							className="close-button"
							onClick={() => setSelectedPromptPart(null)}
						>
							<FontAwesomeIcon icon={faClose} />
						</button>
					)}
					{selectedPromptPart && <Editor />}
				</div>
			</main>
			<Tooltip id="previewButton" />
		</div>
	);
};
