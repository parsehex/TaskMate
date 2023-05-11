import { useState, useEffect, useRef, ChangeEvent, MouseEvent } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Prompt_Part } from '../../../types';
import {
	createPromptPart,
	deletePromptPart,
	getTokenCount,
	updatePromptPart,
} from '../../api';

interface UsePromptPartStateProps {
	promptPart: Prompt_Part;
	promptParts: Prompt_Part[];
	onSelect: (promptPart: Prompt_Part) => void;
	setPromptPart: (promptPart: Prompt_Part) => void;
	setPromptParts: (promptParts: Prompt_Part[]) => void;
	onCheckboxChange: (
		event: React.ChangeEvent<HTMLInputElement>,
		promptPart: Prompt_Part
	) => void;
	movePromptPart: (dragIndex: number, hoverIndex: number) => void;
	index: number;
}

export const usePromptPartState = ({
	promptPart,
	promptParts,
	onSelect,
	setPromptPart,
	setPromptParts,
	onCheckboxChange,
	movePromptPart,
	index,
}: UsePromptPartStateProps) => {
	const ref = useRef<HTMLLIElement>(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const [tokenCount, setTokenCount] = useState(0);

	useEffect(() => {
		getTokenCount({ promptPartId: promptPart.id }).then((data) => {
			if (!data) return;
			setTokenCount(data.token_count);
		});
	}, [promptPart]);

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

	const handleContextMenu = (e: MouseEvent) => {
		e.preventDefault();
		setMenuOpen(true);
	};

	const handleOnSelect = () => {
		onSelect(promptPart);
	};

	const handleNameChange = async (newName: string) => {
		if (newName !== promptPart.name) {
			promptPart.name = newName;
			promptPart = (await updatePromptPart(promptPart.id, { name: newName }))
				.promptPart;
			setPromptPart(promptPart);
		}
	};

	const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
		onCheckboxChange(event, promptPart);
		event.stopPropagation();
	};
	const handleCheckboxClick = (event: MouseEvent<HTMLInputElement>) => {
		event.stopPropagation();
	};

	return {
		menuOpen,
		setMenuOpen,
		isDragging,
		handleContextMenu,
		handleOnSelect,
		handleNameChange,
		handleCheckboxChange,
		handleCheckboxClick,
		tokenCount,
	};
};
