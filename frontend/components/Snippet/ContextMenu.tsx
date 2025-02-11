import React from 'react';
import { ControlledMenu, MenuItem, ClickEvent } from '@szhsin/react-menu';
import { File, Snippet } from '@shared/types';
import { deleteSnippet, updateSnippet, createSnippet } from '@/api/snippets';
import { useStore } from '@/state';
import { EditableNameRef } from '@/components/EditableName';

interface ContextMenuProps {
	snippet: File | Snippet;
	menuOpen: boolean;
	setMenuOpen: (open: boolean) => void;
	anchorRef: React.RefObject<HTMLElement>;
	editableNameRef: React.RefObject<EditableNameRef>;
	move: (dragIndex: number, hoverIndex: number) => Promise<void>;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
	snippet,
	menuOpen,
	setMenuOpen,
	anchorRef,
	editableNameRef,
	move,
}) => {
	const [snippets, setSnippets, setSnippet] = useStore((state) => [
		state.snippets,
		state.setSnippets,
		state.setSnippet,
	]);
	const handleMenuDuplicate = async () => {
		const fieldsNotToCopy = ['id', 'position', 'created_at', 'updated_at'];
		const data = { ...snippet };
		fieldsNotToCopy.forEach((field) => {
			delete data[field];
		});
		data.name = `${data.name} (copy)`;
		const newSnippet = await createSnippet(snippet.project_id, data);
		if (!newSnippet) return;
		setSnippet(newSnippet);
	};
	const handleMenuUseSummary = async () => {
		const data = { ...snippet };
		data.use_summary = !data.use_summary;
		const updatedSnippet = await updateSnippet(data.id, data);
		if (!updatedSnippet) return;
		setSnippet(updatedSnippet);
	};
	const handleMenuUseTitle = async () => {
		const data = { ...snippet };
		data.use_title = !data.use_title;
		const updatedSnippet = await updateSnippet(data.id, data);
		if (!updatedSnippet) return;
		setSnippet(updatedSnippet);
	};
	const handleMenuMoveUp = async () => {
		const thisIndex = snippets.findIndex((s) => s.id === snippet.id);
		const prevIndex = thisIndex - 1;
		if (prevIndex < 0) return;
		await move(thisIndex, prevIndex);
	};
	const handleMenuMoveDown = async () => {
		const thisIndex = snippets.findIndex((s) => s.id === snippet.id);
		const nextIndex = thisIndex + 1;
		if (nextIndex >= snippets.length) return;
		await move(thisIndex, nextIndex);
	};
	const handleMenuDelete = async () => {
		const { id } = snippet;
		await deleteSnippet(id);
		const newSnippets = snippets.filter((part) => part.id !== id);
		setSnippets(newSnippets);
	};

	const handleItemClick = (e: ClickEvent) => {
		e.stopPropagation = true;
		e.syntheticEvent.preventDefault();
		e.syntheticEvent.stopPropagation();
		const value:
			| 'rename'
			| 'duplicate'
			| 'use-summary'
			| 'use-title'
			| 'move-up'
			| 'move-down'
			| 'delete' = e.value;
		switch (value) {
			case 'rename':
				editableNameRef.current?.triggerEdit();
				break;
			case 'duplicate':
				handleMenuDuplicate();
				break;
			case 'use-summary':
				handleMenuUseSummary();
				break;
			case 'use-title':
				handleMenuUseTitle();
				break;
			case 'move-up':
				handleMenuMoveUp();
				break;
			case 'move-down':
				handleMenuMoveDown();
				break;
			case 'delete':
				handleMenuDelete();
				break;
			default:
				console.log('unhandled menu item', value);
				break;
		}
	};

	return (
		<ControlledMenu
			arrow={true}
			state={menuOpen ? 'open' : 'closed'}
			onClose={() => setMenuOpen(false)}
			anchorRef={anchorRef}
			position="anchor"
			direction="right"
			align="center"
			portal={true}
			onItemClick={handleItemClick}
		>
			<MenuItem value="rename">Rename</MenuItem>
			<MenuItem value="duplicate">Duplicate</MenuItem>
			{snippet.summary && (
				<MenuItem
					type="checkbox"
					value="use-summary"
					checked={snippet.use_summary}
				>
					Use Summary
				</MenuItem>
			)}
			<MenuItem type="checkbox" value="use-title" checked={snippet.use_title}>
				Use Title
			</MenuItem>
			<MenuItem value="move-up">Move Up</MenuItem>
			<MenuItem value="move-down">Move Down</MenuItem>
			<MenuItem value="delete">Delete</MenuItem>
		</ControlledMenu>
	);
};
