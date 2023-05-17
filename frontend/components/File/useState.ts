import { useState, useEffect, useRef, ChangeEvent, MouseEvent } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { File } from '../../../shared/types';
import { updateFile } from '../../api/files';
import { useStore } from '../../state';
import { getTokenCount } from '../../api/utils';

interface UseFileStateProps {
	file: File;
}

export const useFileState = ({ file }: UseFileStateProps) => {
	const [setFile, setSelectedPromptPart] = useStore((state) => [
		state.setFile,
		state.setSelectedPromptPart,
	]);
	const [menuOpen, setMenuOpen] = useState(false);
	const [tokenCount, setTokenCount] = useState(0);

	useEffect(() => {
		getTokenCount({ fileId: file.id }).then((data) => {
			if (!data) return;
			setTokenCount(data.token_count);
		});
	}, [file]);

	const handleContextMenu = (e: MouseEvent) => {
		e.preventDefault();
		setMenuOpen(true);
	};

	const handleOnSelect = () => {
		setSelectedPromptPart(file);
	};

	const handleCheckboxChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const included = event.target.checked;
		const updatedFile = await updateFile(file.id, { included });
		setFile(updatedFile);
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
		handleCheckboxChange,
		handleCheckboxClick,
		tokenCount,
	};
};
