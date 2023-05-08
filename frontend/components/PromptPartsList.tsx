import React, { useEffect, useState } from 'react';
import { Prompt_Part } from '../types';
import PromptPart from './PromptPart';
import { createPromptPart, updatePromptPart, updatePromptParts } from '../api';
import SelectCheckbox from './SelectCheckbox';

interface PromptPartsListProps {
	selectedProjectId: number | null;
	promptParts: Prompt_Part[];
	setPromptPart: (promptPart: Prompt_Part) => void;
	setPromptParts: (promptParts: Prompt_Part[]) => void;
	selectedPromptPart: Prompt_Part | null;
	setSelectedPromptPart: (promptPart: Prompt_Part) => void;
}

const PromptPartsList: React.FC<PromptPartsListProps> = ({
	selectedProjectId,
	promptParts,
	setPromptPart,
	setPromptParts,
	selectedPromptPart,
	setSelectedPromptPart,
}) => {
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
		const newPromptPart = (await createPromptPart(selectedProjectId))
			?.promptPart;
		if (!newPromptPart) return;
		setPromptParts([...promptParts, newPromptPart]);
	};

	return (
		<div>
			<div>
				<SelectCheckbox
					label="Select All"
					select={selectAll}
					setSelect={handleSelectAllChange}
				/>
				<button onClick={handleNewSnippetClick}>+ Snippet</button>
			</div>
			<ul className="prompt-parts-list">
				{promptParts.map((promptPart, index) => (
					<PromptPart
						key={promptPart.id}
						promptPart={promptPart}
						onClick={setSelectedPromptPart}
						setPromptPart={setPromptPart}
						onCheckboxChange={onCheckboxChange}
						movePromptPart={movePromptPart}
						index={index}
						selected={selectedPromptPart?.id === promptPart.id}
					/>
				))}
			</ul>
		</div>
	);
};

export default PromptPartsList;
