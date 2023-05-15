import React from 'react';
import { createSnippet, updateSnippets } from '../api/snippets';
import { useStore } from '../state';
import SnippetPart from './Snippet/Snippet';
import FilePart from './File/File';
import Directory from './Directory';
import { createFileHierarchy } from '../file-hierarchy';

const PromptPartsList: React.FC = () => {
	const [
		files,
		snippets,
		setSnippet,
		setSnippets,
		selectedProjectId,
		selectedPromptPart,
	] = useStore((state) => [
		state.files,
		state.snippets,
		state.setSnippet,
		state.setSnippets,
		state.selectedProjectId,
		state.selectedPromptPart,
	]);
	const move = async (dragIndex: number, hoverIndex: number) => {
		const dragged = snippets[dragIndex];
		const data = [...snippets];
		data.splice(dragIndex, 1);
		data.splice(hoverIndex, 0, dragged);

		data.forEach((part, index) => {
			part.position = index;
		});
		const updatedSnippets = await updateSnippets(data);
		setSnippets(updatedSnippets);
	};

	const handleNewSnippetClick = async () => {
		if (!selectedProjectId) return;
		const newSnippet = await createSnippet(selectedProjectId, {});
		if (!newSnippet) return;
		setSnippet(newSnippet);
	};

	const fileHierarchy = createFileHierarchy(files);
	// console.log(fileHierarchy);
	return (
		<div className="prompt-parts-list-container">
			<div className="prompt-parts-list-options">
				<button onClick={handleNewSnippetClick}>+ Snippet</button>
			</div>
			<ul className="prompt-parts-list">
				{snippets.map((part, index) => (
					<li
						key={
							// (console.log(part.name) as any) ||
							part.name
						}
					>
						<SnippetPart
							snippet={part}
							index={index}
							selected={selectedPromptPart?.id === part.id}
							move={move}
						/>
					</li>
				))}
			</ul>
			<ul className="prompt-parts-list">
				{fileHierarchy.children?.map((node, index) => (
					<li
						key={
							// (console.log(node.path) as any) ||
							'file-' + node.path
						}
					>
						{node.promptPart ? (
							<FilePart
								file={node.promptPart}
								index={index}
								selected={selectedPromptPart?.id === node.promptPart.id}
							/>
						) : (
							<Directory node={node} index={index} path={node.path} />
						)}
					</li>
				))}
			</ul>
		</div>
	);
};

export default PromptPartsList;
