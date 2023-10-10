import { Dirent } from 'fs';
import fs from 'fs-extra';
import path from 'path';
import * as fileHelper from './db/helper/files.js';
import * as projectHelper from './db/helper/projects.js';
import { session } from './ws/index.js';
import { fileExists as fileExistsFunc, isDirectory } from './fs-utils.js';
import { shouldIgnorePath, getProjectPath } from './path-utils.js';
import { DefaultIgnoreFiles } from './const.js';
import {
	getSnippetsByProjectId,
	updateSnippet,
	createSnippet,
} from './db/helper/snippets.js';
import { generateFolderStructure } from './projectfiles-note.js';

async function createFilesForProject(
	projectId: number,
	projectName: string,
	folderPath = ''
) {
	const projectPath = await getProjectPath(projectName, folderPath);

	const project = await projectHelper.getProjectById(projectId, 'ignore_files');
	const ignoreFiles = project
		? JSON.parse(project.ignore_files)
		: DefaultIgnoreFiles;

	const items: Dirent[] = await fs.readdir(projectPath, {
		withFileTypes: true,
	});
	// if (projectName === 'Stock Watcher')
	// 	console.log(folderPath + '/' || 'StockWatcher/', items);

	for (const item of items) {
		const itemName = item.name;
		const itemPath = path.join(folderPath, itemName).replace(/\\/g, '/');

		if (shouldIgnorePath(ignoreFiles, itemPath)) {
			continue;
		}

		if (item.isFile()) {
			const existingFiles = await fileHelper.getFiles('id', {
				project_id: projectId,
				name: itemPath,
			});

			if (!existingFiles.length) {
				const file = await fileHelper.createFile(projectId, { name: itemPath });
				console.log(`Added file: ${itemPath} to project: ${projectName}`);

				if (session) {
					session.publish('file.added', [projectId, file]);
				}
			}
		} else if (item.isDirectory()) {
			await createFilesForProject(projectId, projectName, itemPath);
		}
	}
}

async function watchProjectFolder(projectId: number, projectName: string) {
	const projectPath = await getProjectPath(projectName);
	const project = await projectHelper.getProjectById(projectId, 'ignore_files');
	const ignoreFiles = project
		? JSON.parse(project.ignore_files)
		: DefaultIgnoreFiles;

	const handleFileChange = async (eventType: string, fileName: string) => {
		// will be called when a file in the project folder is changed
		const filePath = path.join(projectPath, fileName);
		const fileExists = await fileExistsFunc(filePath);

		// Ignore temp files, including where the name is something like "7D6D9E10"
		if (fileName.endsWith('.tmp')) return;
		if (fileName.match(/^[0-9A-F]{8}$/)) return;

		if (fileExists && (await isDirectory(filePath))) return;
		if (shouldIgnorePath(ignoreFiles, fileName)) return;

		const projectFilesSnippet = (await getSnippetsByProjectId(projectId)).find(
			(snippet) => snippet.name === 'Project Files'
		);
		if (projectFilesSnippet) {
			const structure = await generateFolderStructure(projectId, projectName);
			await updateSnippet(projectFilesSnippet.id, { content: structure });
		}

		if (!fileExists) {
			// File does not exist, it means it was deleted or renamed
			const existingFile = await fileHelper.getFiles('id', {
				project_id: projectId,
				name: fileName,
			});

			if (existingFile.length) {
				await fileHelper.deleteFile(existingFile[0].id);
				console.log(
					`Removed file from db: ${fileName} from project: ${projectName}`
				);

				if (session) {
					session.publish('file.removed', [projectId, existingFile[0].id]);
				}
			}

			return;
		}

		// File exists, check if it is a new file
		const existingFiles = await fileHelper.getFiles('id', {
			project_id: projectId,
			name: fileName,
		});

		if (!existingFiles.length) {
			const file = await fileHelper.createFile(projectId, { name: fileName });
			console.log(`Added file: ${fileName} to project: ${projectName}`);

			if (session) {
				session.publish('file.added', [projectId, file]);
			}
		}
	};
	fs.watch(projectPath, (eventType, fileName) => {
		if (fileName) {
			handleFileChange(eventType, fileName);
		}
	});
}

export async function scanProjectsRoot() {
	const projectsRoot = process.env.PROJECTS_ROOT;
	if (!projectsRoot) {
		console.error('PROJECTS_ROOT environment variable is not set.');
		return;
	}

	try {
		const items = await fs.readdir(projectsRoot, { withFileTypes: true });
		const directories = items.filter(
			(item) => item.isDirectory() || item.isSymbolicLink()
		);

		for (const dir of directories) {
			const projectName = dir.name;
			const existingProject = await projectHelper.getProjects('id', {
				name: projectName,
			});

			let projectId: number;

			if (!existingProject.length) {
				const project = await projectHelper.createProject({
					name: projectName,
					description: '',
					ignore_files: JSON.stringify(DefaultIgnoreFiles),
				});
				projectId = project.id;
				console.log(`Added project: ${projectName}`);
			} else {
				projectId = existingProject[0].id;
				console.log('Found existing project:', projectName);
			}

			const projectFilesSnippet = (
				await getSnippetsByProjectId(projectId)
			).find((snippet) => snippet.name === 'Project Files');
			if (projectFilesSnippet) {
				console.log('Updating Project Files snippet2');
				const structure = await generateFolderStructure(projectId, projectName);
				await updateSnippet(projectFilesSnippet.id, { content: structure });
			}

			await watchProjectFolder(projectId, projectName);
			await createFilesForProject(projectId, projectName);
			console.log('Scanned project:', projectName);
		}
	} catch (error) {
		console.error('Error scanning PROJECTS_ROOT:', error);
	}
}
