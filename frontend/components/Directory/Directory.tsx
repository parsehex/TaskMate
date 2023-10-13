import React from 'react';
import { FileNode } from '../../file-hierarchy';
import { useStore } from '../../state';
import File from '../File/File';
import { useDirectoryState } from './useState';

interface DirectoryProps {
	node: FileNode;
	index: number;
	path: string;
}

const Directory: React.FC<DirectoryProps> = ({ node, index, path }) => {
	const [selectedPromptPart] = useStore((state) => [state.selectedPromptPart]);
	const {
		handleToggle,
		handleSelectAllChange,
		includedFileCount,
		selectAll,
		isCollapsed,
	} = useDirectoryState({
		node,
		path,
	});

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
