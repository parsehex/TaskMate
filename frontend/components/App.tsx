import React, { useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import { X } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { fetchProjects } from '@/lib/api/projects';
import { useStore } from '../state';
import { makePrompt } from '../utils';
import CopyPromptButton from './CopyPromptButton';
import Editor from './Editor';
import ProjectSelector from './ProjectSelector';
import PromptPartsList from './PromptPartsList';
import PreviewPromptButton from './PreviewPromptButton';
import TokenCountDisplay from './TokenCountDisplay';
import { fetchSnippets } from '@/lib/api/snippets';
import { fetchFiles } from '@/lib/api/files';
import { getTokenCount } from '@/lib/api/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ChatPanel from './ChatPanel';
import GuidePanel from './GuidePanel';
import RunPromptButton from './RunPromptButton';

export const App: React.FC = () => {
	const {
		activeTab,
		selectedProjectId,
		snippets,
		files,
		selectedPromptPart,
		includedPromptParts,
		promptTokenCount,
		isConnected,
		setActiveTab,
		setProjects,
		setFiles,
		setSnippets,
		setSelectedPromptPart,
		setSelectedProjectId,
		setPromptTokenCount,
		setIncludedPromptParts,
		setReadOnly,
	} = useStore((state) => state);
	const isChatEnabled = (window as any).electron?.IS_CHAT_ENABLED || false;

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

							<div className="flex flex-col items-start my-2 p-1 px-2 border border-gray-300 rounded-md">
								<div className="text-xs select-none">Prompt</div>
								<div className="grow flex items-center justify-around w-full gap-1">
									<CopyPromptButton label="" />
									<RunPromptButton />
									<PreviewPromptButton />
									<span
										className="ml-auto"
										data-tooltip-id="previewButton"
										data-tooltip-html={includedPromptParts
											.map((part) => '- ' + part.name)
											.join('<br />')}
										data-tooltip-delay-show={250}
										data-data-tooltip-place="bottom"
									>
										<TokenCountDisplay tokenCount={promptTokenCount} /> /{' '}
										{includedPromptParts.length} parts
									</span>
								</div>
							</div>
							<PromptPartsList />
						</div>
					</ResizablePanel>

					<ResizableHandle withHandle />

					<ResizablePanel>
						<Tabs
							value={activeTab}
							onValueChange={setActiveTab}
							className="h-full"
						>
							<TabsList className="flex">
								<TabsTrigger value="editor">Editor</TabsTrigger>
								<TabsTrigger value="chat">Chat</TabsTrigger>
								<TabsTrigger value="guide">Guide</TabsTrigger>
							</TabsList>

							<TabsContent value="editor">
								{selectedPromptPart ? (
									<Editor />
								) : (
									<span>Select a prompt part</span>
								)}
							</TabsContent>

							<TabsContent value="chat">
								{isChatEnabled ? <ChatPanel /> : <span>Chat is disabled</span>}
							</TabsContent>

							<TabsContent value="guide">
								<GuidePanel />
							</TabsContent>
						</Tabs>
					</ResizablePanel>
				</ResizablePanelGroup>
			</main>
			<Tooltip id="previewButton" />
		</div>
	);
};
