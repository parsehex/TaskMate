import { useState, useEffect, ChangeEvent, MouseEvent } from 'react';
import { File } from '@shared/types';
import { updateFile } from '@/lib/api/files';
import { useStore } from '@/state';

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
		if (file.token_count) setTokenCount(file.token_count);
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
