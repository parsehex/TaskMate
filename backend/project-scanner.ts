import { Dirent } from 'fs';
import fs from 'fs-extra';
import path from 'path';
import chokidar from 'chokidar';
import * as fileHelper from './db/helper/files.js';
import * as projectHelper from './db/helper/projects.js';
import { sendToAll } from './api/index.js';
import { fileExists as fileExistsFunc, isDirectory } from './fs-utils.js';
import { shouldIgnorePath, getProjectPath } from './path-utils.js';
import { DefaultIgnoreFiles } from '../shared/const.js';
import {
	getSnippetsByProjectId,
	updateSnippet,
	createSnippet,
} from './db/helper/snippets.js';
import { generateFolderStructure } from './projectfiles-note.js';
import { Project } from '../shared/types/index.js';

const CreateProjectFilesSnippet = async (project: Project) => {
	const { id, name } = project;
	const projectFilesSnippet = (await getSnippetsByProjectId(id)).find(
		(snippet) => snippet.name === 'Project Files'
	);
	if (!projectFilesSnippet) return;
	const structure = await generateFolderStructure(id, name);
	const content = `The following is a list of files in the project:\n${structure}`;
	await updateSnippet(projectFilesSnippet.id, { content });
};

async function createFilesForProject(
	projectId: string,
	projectName: string,
	folderPath = ''
) {
	const projectPath = await getProjectPath({ name: projectName }, folderPath);

	const project = await projectHelper.getProjectById(projectId, 'ignore_files');
	const ignoreFiles = project
		? JSON.parse(project.ignore_files)
		: DefaultIgnoreFiles;

	const items: Dirent[] = await fs.readdir(projectPath, {
		withFileTypes: true,
	});

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

				sendToAll('file.added', [projectId, file]);
			}
		} else if (item.isDirectory()) {
			await createFilesForProject(projectId, projectName, itemPath);
		}
	}
}

async function watchProjectFolder(projectId: string, projectName: string) {
	const projectPath = await getProjectPath({ name: projectName });
	const project = await projectHelper.getProjectById(
		projectId,
		'id,name,ignore_files'
	);
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

		await CreateProjectFilesSnippet(project);

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

				sendToAll('file.removed', [projectId, existingFile[0].id]);
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

			sendToAll('file.added', [projectId, file]);
		}
	};
	const watcher = chokidar.watch(projectPath, {
		ignored: (path) => shouldIgnorePath(DefaultIgnoreFiles, path),
		ignoreInitial: true,
		persistent: true,
	});

	watcher
		.on('add', (filePath) => handleFileChange('added', filePath))
		.on('unlink', (filePath) => handleFileChange('removed', filePath))
		.on('change', (filePath) => handleFileChange('changed', filePath));

	console.log(`Watching project folder: ${projectPath}`);
}

export async function scanProjectsRoot() {
	const projectsRoot = process.env.PROJECTS_ROOT;
	if (!projectsRoot) {
		console.error('PROJECTS_ROOT environment variable is not set.');
		return;
	}

	try {
		const rootParent = path.dirname(projectsRoot);
		const stat = await fs.stat(rootParent);
		if (!stat.isDirectory()) {
			throw new Error('Projects root must be in a folder');
		}
		await fs.ensureDir(projectsRoot);
	} catch (e: any) {
		throw new Error('Could not initialize projects root:' + e?.message);
	}

	try {
		const items = await fs.readdir(projectsRoot, { withFileTypes: true });
		const directories = items.filter(
			(item) => item.isDirectory() || item.isSymbolicLink()
		);

		for (const dir of directories) {
			const projectName = dir.name;
			const existingProject = await projectHelper.getProjects('id,name', {
				name: projectName,
			});

			let projectId: string;

			if (!existingProject.length) {
				const p = path.join(projectsRoot, projectName);
				const project = await projectHelper.createProject({
					name: projectName,
					description: '',
					ignore_files: JSON.stringify(DefaultIgnoreFiles),
					path: p,
				});
				projectId = project.id;
				existingProject.push(project);
				console.log(`Added project: ${projectName}`);
			} else {
				projectId = existingProject[0].id;
				console.log('Found existing project:', projectName);
			}

			await CreateProjectFilesSnippet(existingProject[0]);
			await watchProjectFolder(projectId, projectName);
			await createFilesForProject(projectId, projectName);
			console.log('Scanned project:', projectName);
		}
	} catch (error) {
		console.error('Error scanning PROJECTS_ROOT:', error);
	}
}
