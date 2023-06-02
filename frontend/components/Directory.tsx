import React, { useState, useEffect } from 'react';
import { updateFile, updateFiles } from '../api/files';
import { FileNode } from '../file-hierarchy';
import { useStore } from '../state';
import File from './File/File';

interface DirectoryProps {
	node: FileNode;
	index: number;
	path: string;
}

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

const Directory: React.FC<DirectoryProps> = ({ node, index, path }) => {
	const [files, setFiles, selectedPromptPart] = useStore((state) => [
		state.files,
		state.setFiles,
		state.selectedPromptPart,
	]);
	const [isCollapsed, setIsCollapsed] = useState(true);
	const [selectAll, setSelectAll] = useState(false);

	const handleToggle = () => setIsCollapsed(!isCollapsed);
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

	return (
		<>
			<div onClick={handleToggle} className="directory">
				{node.children && <span>{isCollapsed ? '▶' : '▼'}</span>}
				{node.name}
				{includedFileCount > 0 && (
					<span className="badge">{includedFileCount}</span>
				)}
				<button
					className="select-all"
					onClick={handleSelectAllChange}
					title={selectAll ? 'Deselect All' : 'Select All'}
				>
					{selectAll ? '-' : '+'}
				</button>
			</div>
			{!isCollapsed && node.children && (
				<ul>
					{node.children.map((childNode, thisIndex) => (
						<React.Fragment
							key={
								childNode.promptPart
									? path + '/' + childNode.promptPart.name
									: 'directory-' + path + '/' + childNode.name
							}
						>
							{childNode.promptPart ? (
								<File
									file={childNode.promptPart}
									index={thisIndex}
									selected={selectedPromptPart?.id === childNode.promptPart.id}
								/>
							) : (
								<Directory
									index={thisIndex}
									path={path + '/' + childNode.name}
									node={childNode}
								/>
							)}
						</React.Fragment>
					))}
				</ul>
			)}
		</>
	);
};

export default Directory;
