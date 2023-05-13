import React, { useEffect, useState } from 'react';
import { Prompt_Part } from '../../types';
import { createPromptPart, updatePromptPart, updatePromptParts } from '../api';
import { useStore } from '../state';
import PromptPart from './PromptPart/PromptPart';
import Directory from './Directory';
import { createFileHierarchy } from '../file-hierarchy';

export interface PromptPartsListProps {
	selectedProjectId: number | null;
	promptParts: Prompt_Part[];
	setPromptPart: (promptPart: Prompt_Part) => void;
	setPromptParts: (promptParts: Prompt_Part[]) => void;
	selectedPromptPart: Prompt_Part | null;
	setSelectedPromptPart: (promptPart: Prompt_Part) => void;
}

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
	console.log(fileHierarchy);
	const otherProps = {
		onSelect: setSelectedPromptPart,
		onCheckboxChange,
		movePromptPart,
	};
	return (
		<div className="prompt-parts-list-container">
			<div className="prompt-parts-list-options">
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
