import React, { useRef, useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Prompt_Part } from '../types';
import { getTokenCount, updatePromptPart } from '../api';
import EditableName from './EditableName';
import TokenCountDisplay from './TokenCountDisplay';

interface PromptPartProps {
	promptPart: Prompt_Part;
	onClick: (promptPart: Prompt_Part) => void;
	setPromptPart: (promptPart: Prompt_Part) => void;
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
	setPromptPart,
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

	const handleNameChange = async (newName: string) => {
		if (newName !== promptPart.name) {
			promptPart.name = newName;
			promptPart = (await updatePromptPart(promptPart.id, { name: newName }))
				.promptPart;
			setPromptPart(promptPart);
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
			<div className="flex-1">
				<input
					type="checkbox"
					checked={!!promptPart.included}
					onChange={handleCheckboxChange}
					onClick={handleCheckboxClick}
				/>
				<EditableName
					name={promptPart.name}
					onNameChange={(newName) => {
						handleNameChange(newName);
					}}
				/>
			</div>

			{promptPart.part_type === 'file' && (
				<span className="file-indicator">File</span>
			)}
			<TokenCountDisplay tokenCount={tokenCount} />
		</li>
	);
};

export default PromptPart;
