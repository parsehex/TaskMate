import React, { useRef, useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faFile,
	faHeading,
	faBookOpen,
} from '@fortawesome/free-solid-svg-icons';
import { Prompt_Part } from '../../types';
import { getTokenCount, updatePromptPart } from '../api';
import EditableName from './EditableName';
import TokenCountDisplay from './TokenCountDisplay';

interface PromptPartProps {
	promptPart: Prompt_Part;
	onSelect: (promptPart: Prompt_Part) => void;
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
	onSelect,
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
	const handleOnSelect = () => {
		onSelect(promptPart);
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
			onClick={handleOnSelect}
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
				{promptPart.use_title && (
					<span
						className="indicator title-indicator"
						title="Includes the title"
					>
						T
					</span>
				)}
			</div>

			{promptPart.use_summary && (
				<span className="indicator" title="Uses the summary">
					<FontAwesomeIcon icon={faBookOpen} />
				</span>
			)}
			{promptPart.part_type === 'file' && (
				<span className="indicator" title="Is a file">
					<FontAwesomeIcon icon={faFile} />
				</span>
			)}
			<TokenCountDisplay tokenCount={tokenCount} small={true} />
		</li>
	);
};

export default PromptPart;
