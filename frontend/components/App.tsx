import React, { useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { fetchProjects, fetchPromptParts, getTokenCount } from '../api';
import { useStore } from '../state';
import { makePrompt } from '../utils';
import CopyPromptButton from './CopyPromptButton';
import Editor from './Editor';
import ProjectSelector from './ProjectSelector';
import PromptPartsList from './PromptPartsList';
import PreviewPromptButton from './PreviewPromptButton';
import TokenCountDisplay from './TokenCountDisplay';

export const App: React.FC = () => {
	const {
		selectedProjectId,
		promptParts,
		selectedPromptPart,
		includedPromptParts,
		promptTokenCount,

		setProjects,
		setSelectedPromptPart,
		setSelectedProjectId,
		setPromptTokenCount,
		setIncludedPromptParts,
		setReadOnly,
		setPromptParts,
	} = useStore((state) => state);

	useEffect(() => {
		fetchProjects().then((projects) => setProjects(projects));

		const selectedProjectId = localStorage.getItem('selectedProjectId');
		if (selectedProjectId) {
			setSelectedProjectId(Number(selectedProjectId));
		}
	}, []);

	useEffect(() => {
		if (selectedProjectId) {
			fetchPromptParts(selectedProjectId).then((promptParts) => {
				setPromptParts(promptParts);
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
		const prompt = makePrompt(includedPromptParts);
		getTokenCount({ text: prompt }).then((data) => {
			setPromptTokenCount(data.token_count);
		});
	}, [includedPromptParts]);

	const updateIncludedPromptParts = () => {
		if (promptParts.length > 0) {
			const includedPromptParts = promptParts.filter((part) => part.included);
			setIncludedPromptParts(includedPromptParts);
		}
	};

	useEffect(() => {
		updateIncludedPromptParts();
		if (selectedPromptPart?.id !== -1) {
			setReadOnly(false);
		}
	}, [promptParts]);

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
