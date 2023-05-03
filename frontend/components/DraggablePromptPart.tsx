import React, { useRef, useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Prompt_Part } from './App';

interface DraggablePromptPartProps {
	promptPart: Prompt_Part;
	onClick: (promptPart: Prompt_Part) => void;
	onCheckboxChange: (
		event: React.ChangeEvent<HTMLInputElement>,
		promptPart: Prompt_Part
	) => void;
	movePromptPart: (dragIndex: number, hoverIndex: number) => void;
	index: number;
}

const DraggablePromptPart: React.FC<DraggablePromptPartProps> = ({
	promptPart,
	onClick,
	onCheckboxChange,
	movePromptPart,
	index,
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
				await fetch(`/api/prompt_parts/${promptPart.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ name: newName }),
				});
				onClick({ ...promptPart, name: newName });
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

	const [tokenCount, setTokenCount] = useState(false);
	const tokenCountReq = async () => {
		const response = await fetch(
			`/api/prompt_parts/${promptPart.id}/token_count`
		);
		const data = await response.json();
		setTokenCount(data.token_count);
	};
	useEffect(() => {
		tokenCountReq();
	}, [promptPart]);

	return (
		<li
			ref={ref}
			onClick={handleOnClick}
			style={{
				opacity: isDragging ? 0.5 : 1,
			}}
		>
			<input
				type="checkbox"
				checked={promptPart.included}
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

export default DraggablePromptPart;
