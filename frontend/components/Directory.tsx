import React, { useState, useEffect } from 'react';
import { updateFile } from '../api/files';
import { FileNode } from '../file-hierarchy';
import { useStore } from '../state';
import File from './File/File';

interface DirectoryProps {
	node: FileNode;
	index: number;
	path: string;
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
	const [setFile, selectedPromptPart] = useStore((state) => [
		state.setFile,
		state.selectedPromptPart,
	]);
	const [isCollapsed, setIsCollapsed] = useState(true);
	const [selectAll, setSelectAll] = useState(false);

	const handleToggle = () => setIsCollapsed(!isCollapsed);
	const includedFileCount = countIncludedFiles(node);
	// count node cildren recursively that have promptPart
	const fileCount = node.children?.reduce(countFileNodes, 0) || 0;

	useEffect(() => {
		if (includedFileCount === 0 || includedFileCount < fileCount) {
			setSelectAll(false); // Enable Select All
		} else if (includedFileCount > 0) {
			setSelectAll(true); // Enable Deselect All
		} else {
			setSelectAll(false);
		}
	}, [includedFileCount]);

	const toggleIncludedForAll = async (node: FileNode, included: boolean) => {
		if (node.promptPart && node.promptPart.included !== included) {
			const data = { ...node.promptPart };
			data.included = included;
			const newFile = await updateFile(data.id, data);
			setFile(newFile);
		}

		if (node.children) {
			for (let child of node.children) {
				await toggleIncludedForAll(child, included);
			}
		}
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
