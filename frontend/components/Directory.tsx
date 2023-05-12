import React, { useState } from 'react';
import { FileNode, PromptPartsListProps } from './PromptPartsList';
import File from './File';
import PromptPart from './PromptPart/PromptPart';

interface DirectoryProps extends PromptPartsListProps {
	node: FileNode;
	index: number;
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
	...otherProps
}) => {
	const [isCollapsed, setIsCollapsed] = useState(true);

	const handleToggle = () => setIsCollapsed(!isCollapsed);
	const includedFileCount = countIncludedFiles(node);

	return (
		<li>
			<div onClick={handleToggle}>
				{node.name} ({includedFileCount} included files)
			</div>
			{!isCollapsed && node.children && (
				<ul>
					{node.children.map((childNode, thisIndex) => (
						<>
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
								<Directory index={thisIndex} node={childNode} {...otherProps} />
							)}
						</>
					))}
				</ul>
			)}
		</li>
	);
};

export default Directory;
