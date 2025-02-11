import { useState, useEffect } from 'react';
import { updateFiles } from '@/api/files';
import { useStore } from '@/state';
import { FileNode } from '@/file-hierarchy';

interface UseFileStateProps {
	path: string;
	node: FileNode;
}

const countIncludedFiles = (node: FileNode): number => {
	let count = 0;

	if (node.promptPart?.included) {
		count++;
	}

	if (node.children) {
		for (let child of node.children) {
			count += countIncludedFiles(child);
		}
	}

	return count;
};

const getChildFiles = (node: FileNode) => {
	const files: FileNode[] = [];
	if (node.children) {
		for (let child of node.children) {
			if (child.promptPart) {
				files.push(child);
			} else {
				files.push(...getChildFiles(child));
			}
		}
	}
	return files;
};

const countFileNodes = (count: number, node: FileNode): number => {
	if (node.promptPart) {
		count++;
	}

	if (node.children) {
		for (let child of node.children) {
			count = countFileNodes(count, child);
		}
	}

	return count;
};

export const useDirectoryState = ({ path, node }: UseFileStateProps) => {
	const [files, setFiles] = useStore((state) => [state.files, state.setFiles]);
	const storedState = localStorage.getItem(`dir-${path}`);
	const [isCollapsed, setIsCollapsed] = useState(
		storedState ? JSON.parse(storedState) : true
	);
	const [selectAll, setSelectAll] = useState(false);

	const includedFileCount = countIncludedFiles(node);

	useEffect(() => {
		if (includedFileCount === 0) {
			setSelectAll(false); // Enable Select All
		} else if (includedFileCount > 0) {
			setSelectAll(true); // Enable Deselect All
		} else {
			setSelectAll(false);
		}
	}, [includedFileCount]);

	const handleToggle = () => {
		const newState = !isCollapsed;
		setIsCollapsed(newState);
		localStorage.setItem(`dir-${path}`, JSON.stringify(newState));
	};

	const toggleIncludedForAll = async (node: FileNode, included: boolean) => {
		const childrenFiles = getChildFiles(node);
		const updatedFiles = await updateFiles(
			childrenFiles.map((file) => ({
				id: file.promptPart?.id,
				included,
			}))
		);
		setFiles(
			files.map((file) => {
				const updatedFile = updatedFiles.find(
					(updatedFile) => updatedFile.id === file.id
				);
				if (updatedFile) {
					return updatedFile;
				}
				return file;
			})
		);
	};
	const handleSelectAllChange = async (e: React.MouseEvent) => {
		e.stopPropagation();
		setSelectAll(!selectAll);
		await toggleIncludedForAll(node, !selectAll);
	};

	return {
		files,
		setFiles,
		includedFileCount,
		isCollapsed,
		handleToggle,
		selectAll,
		handleSelectAllChange,
	};
};
