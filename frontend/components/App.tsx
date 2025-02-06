import React, { useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import { X } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import ScanProjectsButton from './ScanProjectsButton';

export const App: React.FC = () => {
	const {
		selectedProjectId,
		snippets,
		files,
		selectedPromptPart,
		includedPromptParts,
		promptTokenCount,
		isConnected,
		setProjects,
		setFiles,
		setSnippets,
		setSelectedPromptPart,
		setSelectedProjectId,
		setPromptTokenCount,
		setIncludedPromptParts,
		setReadOnly,
	} = useStore((state) => state);

	const setReadOnlyValue = () => {
		let readOnly = false;
		if (selectedPromptPart?.id === '-1') readOnly = true;
		if (!isConnected) readOnly = true;
		setReadOnly(readOnly);
	};

	useEffect(() => {
		fetchProjects().then((projects) => {
			const sortedProjects = projects.sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			setProjects(sortedProjects);
		});

		const selectedProjectId = localStorage.getItem('selectedProjectId');
		if (selectedProjectId) {
			setSelectedProjectId(selectedProjectId);
		}
	}, []);

	useEffect(() => {
		if (selectedProjectId !== null) {
			fetchSnippets(selectedProjectId).then((newSnippets) => {
				setSnippets(newSnippets);
			});
			fetchFiles(selectedProjectId).then((newFiles) => {
				setFiles(newFiles);
			});
			setSelectedPromptPart(null);
		}
		if (selectedPromptPart?.id !== '-1') setReadOnlyValue();
	}, [selectedProjectId]);

	useEffect(() => {
		setReadOnlyValue();
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
		if (selectedPromptPart?.id !== '-1') setReadOnlyValue();
	}, [snippets, files]);

	return (
		<div className="h-screen flex flex-col">
			{!isConnected && (
				<Alert variant="destructive" className="mb-2">
					<AlertDescription>
						Connection lost. Changes may not be saved!
					</AlertDescription>
				</Alert>
			)}
			<main className="flex-1 overflow-hidden">
				<ResizablePanelGroup direction="horizontal" className="h-full">
					<ResizablePanel defaultSize={30} minSize={35} maxSize={50}>
						<div className="h-full flex flex-col p-1">
							<ProjectSelector />
							<div className="flex items-center gap-2 my-2">
								{/* TODO */}
								{/* This whole section is revamped to be icons+tooltips:
								Copy | Run | Preview */}
								{/* Run = Send prompt to in-app LLM */}
								<CopyPromptButton />
								<PreviewPromptButton />
								<ScanProjectsButton />
								<span className="ml-auto">
									<TokenCountDisplay tokenCount={promptTokenCount} /> /{' '}
									{includedPromptParts.length} parts
								</span>
							</div>
							<PromptPartsList />
						</div>
					</ResizablePanel>

					<ResizableHandle withHandle />

					<ResizablePanel>
						<div className="h-full relative">
							{selectedPromptPart && (
								<>
									<Button
										variant="ghost"
										size="icon"
										className="absolute top-2 right-2 z-10"
										onClick={() => setSelectedPromptPart(null)}
									>
										<X className="h-4 w-4" />
									</Button>
									<Editor />
									{/* TODO */}
									{/* - Expose whether editor is open */}
									{/* - When the editor is closed, show a chat with LLM */}
								</>
							)}
						</div>
					</ResizablePanel>
				</ResizablePanelGroup>
			</main>
			<Tooltip id="previewButton" />
		</div>
	);
};
