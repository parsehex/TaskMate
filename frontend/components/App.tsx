import React, { useRef } from 'react';
import { useState, useEffect } from 'react';
import Editor from './Editor';
import { Project, Prompt_Part } from '../types';
import {
	fetchProjects,
	fetchPromptParts,
	updatePromptPart,
	getTokenCount,
} from '../api';
import ProjectSelector from './ProjectSelector';
import PromptPartsList from './PromptPartsList';

export const App: React.FC = () => {
	const [projects, setProjects] = useState<Project[]>([]);
	const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
		null
	);
	const [promptParts, setPromptParts] = useState<Prompt_Part[]>([]);
	const [selectedPromptPart, setSelectedPromptPart] =
		useState<Prompt_Part | null>(null);
	const [promptTokenCount, setPromptTokenCount] = useState(0);
	const [includedPromptParts, setIncludedPromptParts] = useState<Prompt_Part[]>(
		[]
	);
	const [readOnly, setReadOnly] = useState(false);

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
	}, [selectedProjectId]);

	const makePrompt = () => {
		const prompt = promptParts
			.filter((part) => part.included)
			.map((part) => part.name + ':\n' + part.content.trim())
			.join('\n\n');
		return prompt;
	};

	useEffect(() => {
		if (promptParts.length > 0) {
			setIncludedPromptParts(promptParts.filter((part) => part.included));
		}

		const prompt = makePrompt();
		getTokenCount({ text: prompt }).then((data) => {
			if (!data) return;
			setPromptTokenCount(data.token_count);
		});
	}, [promptParts]);

	const handleEditorSave = async (newContent: string) => {
		if (selectedPromptPart) {
			const updatedPromptPart = (
				await updatePromptPart(selectedPromptPart.id, {
					content: newContent,
				})
			).promptPart;
			setPromptParts((prevPromptParts) =>
				prevPromptParts.map((prevPromptPart) =>
					prevPromptPart.id === selectedPromptPart.id
						? updatedPromptPart
						: prevPromptPart
				)
			);
		}
	};

	const handlePreviewClick = () => {
		setReadOnly(true);

		// fake Prompt_Part object with the generated prompt content
		const previewPromptPart = {
			id: -1,
			name: 'Prompt Preview',
			content: makePrompt(),
			included: false,
			token_count: 0,
			project_id: selectedProjectId ? selectedProjectId : -1,
		} as Prompt_Part;

		setSelectedPromptPart(previewPromptPart);
	};

	const copyPromptToClipboard = () => {
		fetchPromptParts(selectedProjectId).then((promptParts) => {
			setPromptParts(promptParts);
		});

		const prompt = makePrompt();
		navigator.clipboard.writeText(prompt);
	};

	return (
		<div className="app">
			<header className="app-header">
				<h1>Pair Programming Prompt Builder</h1>
			</header>
			<main className="app-main">
				<div className="sidebar">
					<ProjectSelector
						projects={projects}
						selectedProjectId={selectedProjectId}
						setSelectedProjectId={setSelectedProjectId}
					/>
					<div>
						<button onClick={copyPromptToClipboard}>Copy Prompt</button>
						<button onClick={handlePreviewClick}>Preview</button>
						<span
							className={
								'token-count' + (promptTokenCount >= 4096 ? ' red' : '')
							}
							title={promptTokenCount + ' tokens'}
						>
							{promptTokenCount} tokens / {includedPromptParts.length} parts
						</span>
					</div>

					<PromptPartsList
						selectedProjectId={selectedProjectId}
						promptParts={promptParts}
						setPromptParts={setPromptParts}
						selectedPromptPart={selectedPromptPart}
						setSelectedPromptPart={setSelectedPromptPart}
					/>
				</div>
				<div className="right-sidebar">
					{selectedPromptPart && (
						<Editor
							selectedPromptPartId={selectedPromptPart.id}
							promptParts={promptParts}
							setPromptParts={setPromptParts}
							onSave={handleEditorSave}
							readOnly={readOnly}
						/>
					)}
				</div>
			</main>
		</div>
	);
};
