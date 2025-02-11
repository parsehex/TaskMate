import { File, Prompt_Part } from '@shared/types';

export interface FileNode {
	name: string;
	path: string;
	children?: FileNode[];
	promptPart?: Prompt_Part;
}

export const createFileHierarchy = (files: File[]): FileNode => {
	const root: FileNode = { name: 'root', path: '' };

	for (let file of files) {
		let currentNode = root;
		const directories = file.name.split('/');

		for (let i = 0; i < directories.length; i++) {
			const directory = directories[i];

			let childNode = currentNode.children?.find(
				(child) => child.name === directory
			);

			if (!childNode) {
				childNode = {
					name: directory,
					path: directories.slice(0, i + 1).join('/'),
				};
				if (!currentNode.children) currentNode.children = [];
				currentNode.children.push(childNode);
			}

			if (i === directories.length - 1) {
				childNode.promptPart = file;
			}

			currentNode = childNode;
		}
	}

	// Define a recursive function to sort the tree.
	const sortTree = (node: FileNode) => {
		if (node.children) {
			// Sort children so that directories come before files.
			node.children.sort((a, b) => {
				if (a.children && !b.children) return -1;
				if (!a.children && b.children) return 1;
				return 0;
			});

			// Recursively sort subdirectories.
			for (let child of node.children) {
				sortTree(child);
			}
		}
	};

	// Sort the root node (and by extension, the entire tree).
	sortTree(root);

	return root;
};
