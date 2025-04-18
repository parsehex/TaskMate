import { useState, useEffect, ChangeEvent, MouseEvent } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Snippet } from '@shared/types';
import { updateSnippet } from '@/lib/api/snippets';
import { useStore } from '@/state';

interface UseSnippetStateProps {
	snippet: Snippet;
	move: (dragIndex: number, hoverIndex: number) => Promise<void>;
	index: number;
	ref: React.RefObject<HTMLDivElement>;
}

export const useSnippetState = ({
	snippet,
	move,
	index,
	ref,
}: UseSnippetStateProps) => {
	const returnObj = { isDragging: false };
	const [setSnippet, setSelectedPromptPart] = useStore((state) => [
		state.setSnippet,
		state.setSelectedPromptPart,
	]);
	const [menuOpen, setMenuOpen] = useState(false);
	const [tokenCount, setTokenCount] = useState(0);

	const [, drop] = useDrop({
		accept: 'snippet',
		drop: async (item: any, monitor) => {
			if (!ref.current) return;
			const dragIndex = item.index;
			const hoverIndex = index;
			if (dragIndex === hoverIndex) return;
			await move(dragIndex, hoverIndex);
			item.index = hoverIndex;
		},
	});
	const [{ isDragging }, drag] = useDrag({
		item: { type: 'snippet', id: snippet.id, index },
		collect: (monitor) => {
			// console.log(monitor.isDragging());
			return {
				isDragging: monitor.isDragging(),
			};
		},
		type: 'snippet',
	});
	returnObj['isDragging'] = isDragging;

	drag(drop(ref));

	useEffect(() => {
		if (snippet.token_count) setTokenCount(snippet.token_count);
	}, [snippet]);

	const handleContextMenu = (e: MouseEvent) => {
		e.preventDefault();
		setMenuOpen(true);
	};

	const handleOnSelect = () => {
		setSelectedPromptPart(snippet);
	};

	const handleNameChange = async (newName: string) => {
		if (newName !== snippet.name) {
			snippet.name = newName;
			snippet = await updateSnippet(snippet.id, { name: newName });
			setSnippet(snippet);
		}
	};

	const handleCheckboxChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const included = event.target.checked;
		const data = { included } as any;
		const isFileSnippet = snippet.id.startsWith('file-backed:');
		if (isFileSnippet) {
			// set this data so that it's returned back to us
			data.project_id = snippet.project_id;
			data.name = snippet.name;
			data.use_title = snippet.use_title;
			data.content = snippet.content;
		}
		const updatedFile = await updateSnippet(snippet.id, data);
		setSnippet(updatedFile);
		event.stopPropagation();
	};
	const handleCheckboxClick = (event: MouseEvent<HTMLInputElement>) => {
		event.stopPropagation();
	};

	return {
		menuOpen,
		setMenuOpen,
		handleContextMenu,
		handleOnSelect,
		handleNameChange,
		handleCheckboxChange,
		handleCheckboxClick,
		tokenCount,
		...returnObj,
	};
};
