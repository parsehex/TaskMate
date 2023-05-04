import React, { useRef, useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Prompt_Part } from '../types';
import { getTokenCount, updatePromptPart } from '../api';

interface PromptPartProps {
	promptPart: Prompt_Part;
	onClick: (promptPart: Prompt_Part) => void;
	onCheckboxChange: (
		event: React.ChangeEvent<HTMLInputElement>,
		promptPart: Prompt_Part
	) => void;
	movePromptPart: (dragIndex: number, hoverIndex: number) => void;
	index: number;
	selected: boolean;
}

const PromptPart: React.FC<PromptPartProps> = ({
	promptPart,
	onClick,
	onCheckboxChange,
	movePromptPart,
	index,
	selected,
}) => {
	const ref = useRef<HTMLLIElement>(null);

	const [, drop] = useDrop({
		accept: 'prompt-part',
		drop: (item: any, monitor) => {
			if (!ref.current) return;
			const dragIndex = item.index;
			const hoverIndex = index;
			if (dragIndex === hoverIndex) return;
			movePromptPart(dragIndex, hoverIndex);
			item.index = hoverIndex;
		},
	});

	const [{ isDragging }, drag] = useDrag({
		item: { type: 'prompt-part', id: promptPart.id, index },
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
		type: 'prompt-part',
	});

	drag(drop(ref));

	// Add new state for editing the name
	const [isEditingName, setIsEditingName] = useState(false);

	// Create a function to toggle the editing state
	const handleNameEdit = () => {
		setIsEditingName(true);
	};

	// Create a function to handle name change
	const handleNameChange = async (
		event:
			| React.FocusEvent<HTMLInputElement>
			| React.KeyboardEvent<HTMLInputElement>
	) => {
		if (
			event.type === 'blur' ||
			(event.type === 'keydown' && 'key' in event && event.key === 'Enter')
		) {
			setIsEditingName(false);
			const newName = event.currentTarget.value;
			if (newName !== promptPart.name) {
				promptPart.name = newName;
				promptPart = (await updatePromptPart(promptPart.id, { name: newName }))
					.promptPart;
				onClick(promptPart);
			}
		}
	};

	const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		onCheckboxChange(event, promptPart);
	};
	const handleCheckboxClick = (event: React.MouseEvent<HTMLInputElement>) => {
		event.stopPropagation();
	};
	const handleOnClick = () => {
		onClick(promptPart);
	};

	const [tokenCount, setTokenCount] = useState(0);
	useEffect(() => {
		// console.log(promptPart);
		getTokenCount({ promptPartId: promptPart.id }).then((data) => {
			if (!data) return;
			setTokenCount(data.token_count);
		});
	}, [promptPart]);

	return (
		<li
			ref={ref}
			className={`prompt-part ${selected ? 'selected' : ''}`}
			onClick={handleOnClick}
			style={{
				opacity: isDragging ? 0.5 : 1,
			}}
		>
			<input
				type="checkbox"
				checked={!!promptPart.included}
				onChange={handleCheckboxChange}
				onClick={handleCheckboxClick}
			/>
			{isEditingName ? (
				<input
					type="text"
					className="prompt-part-name"
					defaultValue={promptPart.name}
					onBlur={handleNameChange}
					onKeyDown={handleNameChange}
					autoFocus
				/>
			) : (
				<span className="prompt-part-name" onDoubleClick={handleNameEdit}>
					{promptPart.name}
				</span>
			)}
			{promptPart.part_type === 'file' && (
				<span className="file-indicator">File</span>
			)}
			<span className="token-count" title={tokenCount + ' tokens'}>
				{tokenCount}
			</span>
		</li>
	);
};

export default PromptPart;
