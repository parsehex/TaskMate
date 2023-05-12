import React, { useEffect, useState } from 'react';
import { Prompt_Part } from '../../types';
import { createPromptPart, updatePromptPart, updatePromptParts } from '../api';
import { useStore } from '../state';
import PromptPart from './PromptPart/PromptPart';
import Directory from './Directory';
import SelectCheckbox from './SelectCheckbox';

export interface PromptPartsListProps {
	selectedProjectId: number | null;
	promptParts: Prompt_Part[];
	setPromptPart: (promptPart: Prompt_Part) => void;
	setPromptParts: (promptParts: Prompt_Part[]) => void;
	selectedPromptPart: Prompt_Part | null;
	setSelectedPromptPart: (promptPart: Prompt_Part) => void;
}

export interface FileNode {
	name: string;
	path: string;
	children?: FileNode[];
	promptPart?: Prompt_Part;
}

const createFileHierarchy = (promptParts: Prompt_Part[]): FileNode => {
	const root: FileNode = { name: 'root', path: '' };

	for (let promptPart of promptParts) {
		if (promptPart.part_type === 'file') {
			let currentNode = root;
			const directories = promptPart.name.split('/');

			for (let i = 0; i < directories.length; i++) {
				const directory = directories[i];

				let childNode = currentNode.children?.find(
					(child) => child.name === directory
				);

				if (!childNode) {
					childNode = {
						name: directory,
						path: directories.slice(0, i + 1).join('/'),
					};
					if (!currentNode.children) currentNode.children = [];
					currentNode.children.push(childNode);
				}

				if (i === directories.length - 1) {
					childNode.promptPart = promptPart;
				}

				currentNode = childNode;
			}
		}
	}

	// Define a recursive function to sort the tree.
	const sortTree = (node: FileNode) => {
		if (node.children) {
			// Sort children so that directories come before files.
			node.children.sort((a, b) => {
				if (a.children && !b.children) return -1;
				if (!a.children && b.children) return 1;
				return 0;
			});

			// Recursively sort subdirectories.
			for (let child of node.children) {
				sortTree(child);
			}
		}
	};

	// Sort the root node (and by extension, the entire tree).
	sortTree(root);

	return root;
};

const PromptPartsList: React.FC = () => {
	const [
		promptParts,
		setPromptParts,
		selectedProjectId,
		selectedPromptPart,
		setSelectedPromptPart,
	] = useStore((state) => [
		state.promptParts,
		state.setPromptParts,
		state.selectedProjectId,
		state.selectedPromptPart,
		state.setSelectedPromptPart,
	]);
	const movePromptPart = async (dragIndex: number, hoverIndex: number) => {
		const dragPromptPart = promptParts[dragIndex];
		const updatedPromptParts = [...promptParts];
		updatedPromptParts.splice(dragIndex, 1);
		updatedPromptParts.splice(hoverIndex, 0, dragPromptPart);

		updatedPromptParts.forEach((part, index) => {
			part.position = index;
		});

		await updatePromptParts(
			updatedPromptParts.map((part) => part.id),
			updatedPromptParts
		);

		setPromptParts(updatedPromptParts);
	};

	const [selectAll, setSelectAll] = useState(false);
	useEffect(() => {
		if (promptParts.length > 0) {
			const allChecked = promptParts.every((part) => part.included);
			setSelectAll(allChecked);
		}
	}, [promptParts]);

	const handleSelectAllChange = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const isChecked = event.target.checked;
		setSelectAll(isChecked);

		const updatedParts: Prompt_Part[] = [];

		for (const promptPart of promptParts) {
			const updatedPart = (
				await updatePromptPart(promptPart.id, {
					included: isChecked,
				})
			).promptPart;
			updatedParts.push(updatedPart);
		}
		setPromptParts(updatedParts);
	};

	const onCheckboxChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
		promptPart: Prompt_Part
	) => {
		const included = event.target.checked;
		promptPart.included = included;
		const updatedPromptPart = (
			await updatePromptPart(promptPart.id, { included })
		).promptPart;
		setPromptParts(
			promptParts.map((part) =>
				part.id === updatedPromptPart.id ? updatedPromptPart : part
			)
		);
	};

	const handleNewSnippetClick = async () => {
		const newPromptPart = (await createPromptPart(selectedProjectId, {}))
			?.promptPart;
		if (!newPromptPart) return;
		setPromptParts([...promptParts, newPromptPart]);
	};

	const fileHierarchy = createFileHierarchy(promptParts);
	const otherProps = {
		onSelect: setSelectedPromptPart,
		onCheckboxChange,
		movePromptPart,
	};
	return (
		<div className="prompt-parts-list-container">
			<div className="prompt-parts-list-options">
				<SelectCheckbox
					label="Select All"
					select={selectAll}
					setSelect={handleSelectAllChange}
				/>
				<button onClick={handleNewSnippetClick}>+ Snippet</button>
			</div>
			<ul className="prompt-parts-list">
				{promptParts
					.filter((v) => v.part_type === 'snippet')
					.map((part, index) => (
						<li
							key={
								// (console.log(part.name) as any) ||
								part.name
							}
						>
							<PromptPart
								promptPart={part}
								index={index}
								selected={selectedPromptPart?.id === part.id}
								{...otherProps}
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
							<PromptPart
								promptPart={node.promptPart}
								index={index}
								selected={selectedPromptPart?.id === node.promptPart.id}
								{...otherProps}
							/>
						) : (
							<Directory
								node={node}
								index={index}
								path={node.path}
								{...(otherProps as any)}
							/>
						)}
					</li>
				))}
			</ul>
		</div>
	);
};

export default PromptPartsList;
