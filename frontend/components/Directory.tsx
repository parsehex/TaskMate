import React, { useState } from 'react';
import { PromptPartsListProps } from './PromptPartsList';
import PromptPart from './PromptPart/PromptPart';
import { FileNode } from '../file-hierarchy';

interface DirectoryProps extends PromptPartsListProps {
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

const Directory: React.FC<DirectoryProps> = ({
	node,
	index,
	path,
	...otherProps
}) => {
	const [isCollapsed, setIsCollapsed] = useState(true);

	const handleToggle = () => setIsCollapsed(!isCollapsed);
	const includedFileCount = countIncludedFiles(node);

	return (
		<>
			<div onClick={handleToggle} className="directory">
				{node.children && <span>{isCollapsed ? '▶' : '▼'}</span>}
				{node.name}
				{includedFileCount > 0 && (
					<span className="badge">{includedFileCount}</span>
				)}
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
								<PromptPart
									promptPart={childNode.promptPart}
									index={thisIndex}
									selected={
										otherProps.selectedPromptPart?.id ===
										childNode.promptPart.id
									}
									{...(otherProps as any)}
								/>
							) : (
								<Directory
									index={thisIndex}
									path={path + '/' + childNode.name}
									node={childNode}
									{...otherProps}
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
