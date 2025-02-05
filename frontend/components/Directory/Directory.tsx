import React from 'react';
import { FileNode } from '../../file-hierarchy';
import { useStore } from '../../state';
import File from '../File/File';
import { useDirectoryState } from './useState';
import { Folder, FolderOpen } from 'lucide-react';

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
			<div
				onClick={handleToggle}
				className="flex items-center gap-2 cursor-pointer p-2 hover:bg-accent rounded-md"
			>
				{node.children && (
					<span>
						{isCollapsed ? <Folder size={16} /> : <FolderOpen size={16} />}
					</span>
				)}
				<span className="font-medium">{node.name}</span>

				{includedFileCount > 0 && (
					<span className="ml-auto text-xs px-2 py-1 bg-muted rounded-md">
						{includedFileCount}
					</span>
				)}

				<button
					className="text-xs px-1 border rounded hover:bg-secondary"
					onClick={handleSelectAllChange}
					title={selectAll ? 'Deselect All' : 'Select All'}
				>
					{selectAll ? '−' : '+'}
				</button>
			</div>

			{!isCollapsed && node.children && (
				<ul className="pl-4 border-l border-muted">
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
