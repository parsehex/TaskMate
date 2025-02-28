import React from 'react';
import { FileNode } from '@/file-hierarchy';
import { useStore } from '@/state';
import File from '@/components/File/File';
import { useDirectoryState } from './useState';
import { Folder, FolderOpen, Minus, Plus } from 'lucide-react';
import type { File as FileType } from '@shared/types';

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

	const selectButtonClasses = selectAll
		? 'p-1 border rounded bg-rose-100 text-black hover:bg-rose-200 transition-colors'
		: 'p-1 border rounded bg-blue-100 text-black hover:bg-blue-200 transition-colors';

	return (
		<>
			<div
				onClick={handleToggle}
				className="flex items-center gap-2 cursor-pointer p-1 hover:bg-accent rounded-md"
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
					className={selectButtonClasses}
					onClick={(e) => {
						e.stopPropagation();
						handleSelectAllChange(e);
					}}
					title={selectAll ? 'Deselect All' : 'Select All'}
				>
					{selectAll ? (
						<Minus className="h-2 w-2" />
					) : (
						<Plus className="h-2 w-2" />
					)}
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
									file={childNode.promptPart as FileType}
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
