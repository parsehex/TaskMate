import React from 'react';
import { createSnippet, updateSnippets } from '../api/snippets';
import { useStore } from '../state';
import SnippetPart from './Snippet/Snippet';
import FilePart from './File/File';
import Directory from './Directory/Directory';
import { createFileHierarchy } from '../file-hierarchy';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, X } from 'lucide-react';
import {
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
} from '@/components/ui/resizable';
import { updateFiles } from '@/api/files';

const PromptPartsList: React.FC = () => {
	const [
		files,
		snippets,
		setSnippets,
		setFiles,
		selectedProjectId,
		selectedPromptPart,
	] = useStore((state) => [
		state.files,
		state.snippets,
		state.setSnippets,
		state.setFiles,
		state.selectedProjectId,
		state.selectedPromptPart,
	]);

	const selectedSnippetsCount = snippets.filter(
		(snippet) => snippet.included
	).length;
	const selectedFilesCount = files.filter((file) => file.included).length;

	const move = async (dragIndex: number, hoverIndex: number) => {
		const dragged = snippets[dragIndex];
		let data = [...snippets];
		data.splice(dragIndex, 1); // remove dragged element
		data.splice(hoverIndex, 0, dragged); // insert dragged element at hoverIndex

		data.forEach((part, index) => {
			part.position = index;
		});

		// should only update snippets that have changed
		data = data.filter(
			(part, index) => part.position !== snippets[index].position
		);

		// combine with existing snippets, without duplicates
		const d = await updateSnippets(data);
		const updatedSnippets = d
			.reduce((acc, snippet) => {
				if (!acc.find((s) => s.id === snippet.id)) {
					acc.push(snippet);
				}
				return acc;
			}, snippets)
			.sort((a, b) => a.position - b.position);
		setSnippets(updatedSnippets);
	};

	const handleNewSnippetClick = async () => {
		if (!selectedProjectId) return;
		const position = snippets.length;
		const name = 'Snippet ' + (position + 1);
		const newSnippet = await createSnippet(selectedProjectId, {
			name,
			position,
		});
		if (!newSnippet) return;
		setSnippets([...snippets, newSnippet]);
	};

	const handleClearSnippets = async () => {
		const updatedSnippets = snippets.map((snippet) => ({
			...snippet,
			included: false,
		}));

		await updateSnippets(updatedSnippets); // Persist to API
		setSnippets(updatedSnippets);
	};

	const handleClearFiles = async () => {
		const updatedFiles = files.map((file) => ({
			...file,
			included: false,
		}));

		await updateFiles(updatedFiles); // Persist to API
		setFiles(updatedFiles);
	};

	const fileHierarchy = createFileHierarchy(files);

	return (
		<div className="flex flex-col h-full">
			<ResizablePanelGroup direction="vertical" className="flex-1">
				<ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
					<ScrollArea className="border rounded-md h-full">
						<div className="sticky top-0 bg-neutral-300 flex justify-between items-center px-2 mb-1 border-b">
							<h3 className="text-sm font-medium">
								Snippets ({selectedSnippetsCount})
							</h3>
							<Button
								onClick={handleNewSnippetClick}
								className="px-4 rounded-md hover:bg-neutral-200"
								variant="link"
								size="sm"
							>
								<Plus className="h-4 w-4 mr-2" />
								New Snippet
							</Button>
							<Button
								onClick={handleClearSnippets}
								disabled={selectedSnippetsCount <= 0}
								variant="ghost"
								size="sm"
								className="text-muted-foreground"
							>
								<X className="h-4 w-4 mr-1" />
								Clear
							</Button>
						</div>

						<ul className="space-y-1 px-1 border-muted">
							{snippets.map((part, index) => (
								<li key={part.name}>
									<SnippetPart
										snippet={part}
										index={index}
										selected={selectedPromptPart?.id === part.id}
										move={move}
									/>
								</li>
							))}
						</ul>
					</ScrollArea>
				</ResizablePanel>

				<ResizableHandle withHandle />

				<ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
					<ScrollArea className="border rounded-md h-full">
						<div className="sticky top-0 bg-neutral-300 flex justify-between items-center px-2 border-b">
							<h3 className="text-sm font-medium">
								Files ({selectedFilesCount})
							</h3>
							<Button
								onClick={handleClearFiles}
								disabled={selectedFilesCount <= 0}
								variant="ghost"
								size="sm"
								className="text-muted-foreground"
							>
								<X className="h-4 w-4 mr-1" />
								Clear
							</Button>
						</div>

						<ul className="space-y-1 pl-2 border-l border-muted">
							{fileHierarchy.children?.map((node, index) => (
								<li key={'file-' + node.path}>
									{node.promptPart ? (
										<FilePart
											file={node.promptPart as any}
											index={index}
											selected={selectedPromptPart?.id === node.promptPart.id}
										/>
									) : (
										<Directory node={node} index={index} path={node.path} />
									)}
								</li>
							))}
						</ul>
					</ScrollArea>
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
};

export default PromptPartsList;
