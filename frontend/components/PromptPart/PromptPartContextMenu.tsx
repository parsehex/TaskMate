import React from 'react';
import { Menu, MenuButton, ControlledMenu, MenuItem } from '@szhsin/react-menu';
import { Prompt_Part } from '../../../types';
import { EditableNameRef } from '../EditableName';
import { createPromptPart, deletePromptPart } from '../../api';

interface PromptPartContextMenuProps {
	promptPart: Prompt_Part;
	promptParts: Prompt_Part[];
	setPromptPart: (promptPart: Prompt_Part) => void;
	setPromptParts: (promptParts: Prompt_Part[]) => void;
	menuOpen: boolean;
	setMenuOpen: (open: boolean) => void;
	anchorRef: React.RefObject<HTMLLIElement>;
	editableNameRef: React.RefObject<EditableNameRef>;
}

const PromptPartContextMenu: React.FC<PromptPartContextMenuProps> = ({
	promptPart,
	promptParts,
	setPromptPart,
	setPromptParts,
	menuOpen,
	setMenuOpen,
	anchorRef,
	editableNameRef,
}) => {
	const handleMenuIgnoreFile = (e: any) => {
		e.preventDefault();
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
	const handleMenuMoveToTop = (e: any) => {
		console.log(e);
		e.stopPropagation = true;
	};
	const handleMenuMoveToBottom = () => {};
	const handleMenuDelete = async (e: any) => {
		e.preventDefault();
		const { id } = promptPart;
		await deletePromptPart(id);
		const newPromptParts = promptParts.filter((part) => part.id !== id);
		setPromptParts(newPromptParts);
	};

	return (
		<ControlledMenu
			state={menuOpen ? 'open' : 'closed'}
			onClose={() => setMenuOpen(false)}
			anchorRef={anchorRef}
			position="anchor"
			direction="bottom"
			align="center"
		>
			<MenuItem onClick={() => editableNameRef?.current?.triggerEdit()}>
				Rename
			</MenuItem>
			{promptPart.part_type === 'file' && (
				<MenuItem onClick={handleMenuIgnoreFile}>Ignore File</MenuItem>
			)}
			{promptPart.part_type === 'snippet' && (
				<MenuItem onClick={handleMenuDuplicate}>Duplicate</MenuItem>
			)}
			<MenuItem onClick={handleMenuMoveToTop}>Move to Top</MenuItem>
			<MenuItem onClick={handleMenuMoveToBottom}>Move to Bottom</MenuItem>
			<MenuItem onClick={handleMenuDelete}>Delete</MenuItem>
		</ControlledMenu>
	);
};

export default PromptPartContextMenu;
