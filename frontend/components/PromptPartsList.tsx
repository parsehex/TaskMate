import React from 'react';
import { createSnippet, updateSnippets } from '../api/snippets';
import { useStore } from '../state';
import SnippetPart from './Snippet/Snippet';
import FilePart from './File/File';
import Directory from './Directory/Directory';
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
		// get new name based on existing names
		const name = 'Snippet ' + (snippets.length + 1);
		const newSnippet = await createSnippet(selectedProjectId, { name });
		if (!newSnippet) return;
		setSnippets([...snippets, newSnippet]);
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
