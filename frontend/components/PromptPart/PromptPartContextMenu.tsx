import React from 'react';
import { ControlledMenu, MenuItem, ClickEvent } from '@szhsin/react-menu';
import { Prompt_Part } from '../../../types';
import { EditableNameRef } from '../EditableName';
import {
	createPromptPart,
	deletePromptPart,
	updatePromptPart,
} from '../../api';
import { useStore } from '../../state';

interface PromptPartContextMenuProps {
	promptPart: Prompt_Part;
	menuOpen: boolean;
	setMenuOpen: (open: boolean) => void;
	anchorRef: React.RefObject<HTMLElement>;
	editableNameRef: React.RefObject<EditableNameRef>;
}

const PromptPartContextMenu: React.FC<PromptPartContextMenuProps> = ({
	promptPart,
	menuOpen,
	setMenuOpen,
	anchorRef,
	editableNameRef,
}) => {
	const [promptParts, setPromptParts, setPromptPart] = useStore((state) => [
		state.promptParts,
		state.setPromptParts,
		state.setPromptPart,
	]);
	const handleMenuIgnoreFile = () => {
		// get project
		// update project's ignore_file to include this file's name
		// note because the way the project scanner works, we should add just the file's name, not the full path (which is the promptPart.name)
	};
	const handleMenuDuplicate = async () => {
		const fieldsNotToCopy = ['id', 'position', 'created_at', 'updated_at'];
		const newPromptPart = { ...promptPart };
		fieldsNotToCopy.forEach((field) => {
			delete newPromptPart[field];
		});
		newPromptPart.name = `${newPromptPart.name} (copy)`;
		const createdPromptPart = await createPromptPart(
			promptPart.project_id,
			newPromptPart
		);
		if (!createdPromptPart) return;
		setPromptPart(createdPromptPart.promptPart);
	};
	const handleMenuUseSummary = async () => {
		const part = { ...promptPart };
		part.use_summary = !part.use_summary;
		const updatedPromptPart = await updatePromptPart(part.id, part);
		if (!updatedPromptPart) return;
		setPromptPart(updatedPromptPart.promptPart);
	};
	const handleMenuUseTitle = async () => {
		const part = { ...promptPart };
		part.use_title = !part.use_title;
		const updatedPromptPart = await updatePromptPart(part.id, part);
		if (!updatedPromptPart) return;
		setPromptPart(updatedPromptPart.promptPart);
	};
	const handleMenuMoveToTop = () => {};
	const handleMenuMoveToBottom = () => {};
	const handleMenuDelete = async () => {
		const { id } = promptPart;
		await deletePromptPart(id);
		const newPromptParts = promptParts.filter((part) => part.id !== id);
		setPromptParts(newPromptParts);
	};

	const handleItemClick = (e: ClickEvent) => {
		e.stopPropagation = true;
		e.syntheticEvent.preventDefault();
		e.syntheticEvent.stopPropagation();
		const value:
			| 'rename'
			| 'ignore-file'
			| 'duplicate'
			| 'use-summary'
			| 'use-title'
			| 'move-to-top'
			| 'move-to-bottom'
			| 'delete' = e.value;
		switch (value) {
			case 'rename':
				editableNameRef?.current?.triggerEdit();
				break;
			case 'ignore-file':
				handleMenuIgnoreFile();
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
			case 'move-to-top':
				handleMenuMoveToTop();
				break;
			case 'move-to-bottom':
				handleMenuMoveToBottom();
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
			{promptPart.part_type === 'file' && (
				<MenuItem value="ignore-file">Ignore File</MenuItem>
			)}

			{promptPart.part_type === 'snippet' && (
				<MenuItem value="rename">Rename</MenuItem>
			)}
			{promptPart.part_type === 'snippet' && (
				<MenuItem value="duplicate">Duplicate</MenuItem>
			)}
			<MenuItem value="use-summary">Use Summary</MenuItem>
			<MenuItem value="use-title">Use Title</MenuItem>
			<MenuItem value="move-to-top">Move to Top</MenuItem>
			<MenuItem value="move-to-bottom">Move to Bottom</MenuItem>
			<MenuItem value="delete">Delete</MenuItem>
		</ControlledMenu>
	);
};

export default PromptPartContextMenu;
