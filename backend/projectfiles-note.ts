// Project Files Note manager
// For projects that have a note called "Project Files", this module will watch the project folder for changes and update the note accordingly.
// Idea: when a folder has a file called something like "file-desc.txt", the contents of that file will be used as the description for the files in that folder. This file could be editable in the UI later on.

import { Dirent } from 'fs';
import fs from 'fs-extra';
import path from 'path';
import * as fileHelper from './db/helper/files.js';
import * as projectHelper from './db/helper/projects.js';
import { session } from './ws/index.js';
import { fileExists, isDirectory } from './fs-utils.js';
import { shouldIgnorePath, getProjectPath } from './path-utils.js';
import { DefaultIgnoreFiles } from './const.js';

export async function generateFolderStructure(
	projectId: number,
	projectName: string,
	folderPath = '',
	indent = 0
): Promise<string> {
	const projectFolderPath = await getProjectPath(projectName, folderPath);

	const project = await projectHelper.getProjectById(projectId, 'ignore_files');
	const ignoreFiles = project
		? JSON.parse(project.ignore_files)
		: DefaultIgnoreFiles;

	let items: Dirent[] = await fs.readdir(projectFolderPath, {
		withFileTypes: true,
	});

	// Sort the items: directories first, then files.
	items = items.sort((a, b) => {
		if (a.isDirectory() && b.isFile()) return -1;
		if (a.isFile() && b.isDirectory()) return 1;
		return a.name.localeCompare(b.name);
	});

	const fileItems = items.filter((item) => item.isFile());
	const directoryItems = items.filter((item) => item.isDirectory());

	// Group files by extension
	const fileGroups: Record<string, Dirent[]> = {};
	fileItems.forEach((fileItem) => {
		const ext = path.extname(fileItem.name);
		if (!fileGroups[ext]) {
			fileGroups[ext] = [];
		}
		fileGroups[ext].push(fileItem);
	});

	let structure = '';
	const indentation = ' '.repeat(indent);

	// Handle directories
	for (const directory of directoryItems) {
		const itemName = directory.name;
		const itemPath = path.join(folderPath, itemName).replace(/\\/g, '/');
		if (shouldIgnorePath(ignoreFiles, itemPath)) {
			continue;
		}

		structure += `${indentation}${itemName}/\n`;
		structure += await generateFolderStructure(
			projectId,
			projectName,
			itemPath,
			indent + 1
		);
	}

	// Handle files
	const descriptions = await getFileDescriptions(projectFolderPath);
	for (const ext in fileGroups) {
		if (fileGroups[ext].length > 1) {
			const baseNames = fileGroups[ext]
				.map((f) => {
					const baseName = path.basename(f.name, ext);
					const description = descriptions[f.name];
					return description ? `${baseName}:${description}` : baseName;
				})
				.join(','); // Removed the space after the comma
			structure += `${indentation}(${baseNames})${ext}\n`; // Moved the extension outside and immediately after the parenthesis
		} else {
			const fileName = fileGroups[ext][0].name;
			const description = descriptions[fileName];
			structure += description
				? `${indentation}${fileName}:${description}\n`
				: `${indentation}${fileName}\n`;
		}
	}

	return structure;
}

async function getFileDescriptions(
	folderPath: string
): Promise<Record<string, string>> {
	const descriptionsPath = path.join(folderPath, 'file-descriptions.json');
	if (await fileExists(descriptionsPath)) {
		const content = await fs.readFile(descriptionsPath, 'utf8');
		return JSON.parse(content);
	}
	return {};
}
