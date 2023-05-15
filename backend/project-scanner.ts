import fs from 'fs-extra';
import path from 'path';
import { Dirent } from 'fs';
import * as projectHelper from './db/helper/projects.js';
import * as fileHelper from './db/helper/files.js';
import { fileExists } from './fs-utils.js';
import { shouldIgnorePath, getProjectPath } from './path-utils.js';
import { DefaultIgnoreFiles } from './const.js';

async function createFilesForProject(
	projectId: number,
	projectName: string,
	folderPath = ''
) {
	const projectPath = getProjectPath(projectName, folderPath);

	const project = await projectHelper.getProjectById(projectId, 'ignore_files');
	const ignoreFiles = project ? JSON.parse(project.ignore_files) : [];

	const items: Dirent[] = await fs.readdir(projectPath, {
		withFileTypes: true,
	});

	for (const item of items) {
		const itemName = item.name;
		const itemPath = path.join(folderPath, itemName).replace(/\\/g, '/');

		if (await shouldIgnorePath(ignoreFiles, itemName)) {
			continue;
		}

		if (item.isFile()) {
			// const existingPromptParts: any[] = await db.all(
			// 	'SELECT id FROM prompt_parts WHERE project_id = ? AND name = ?',
			// 	[projectId, itemPath]
			// );
			const existingFiles = await fileHelper.getFiles('id', {
				project_id: projectId,
				name: itemPath,
			});

			if (!existingFiles.length) {
				await fileHelper.createFile(projectId, { name: itemPath });
				console.log(
					`Added prompt part: ${itemPath} in project: ${projectName}`
				);
			}
		} else if (item.isDirectory()) {
			await createFilesForProject(projectId, projectName, itemPath);
		}
	}
}

async function watchProjectFolder(projectId: number, projectName: string) {
	const projectPath = getProjectPath(projectName);

	const handleFileChange = async (eventType: string, fileName: string) => {
		const filePath = path.join(projectPath, fileName);
		const fileExistsFlag = await fileExists(filePath);

		if (await shouldIgnorePath(DefaultIgnoreFiles, fileName)) {
			return;
		}

		if (!fileExistsFlag) {
			// File does not exist, it means it was deleted or renamed
			// const existingFile: any[] = await db.all(
			// 	'SELECT id FROM files WHERE project_id = ? AND name = ?',
			// 	[projectId, fileName]
			// );
			const existingFile = await fileHelper.getFiles('id', {
				project_id: projectId,
				name: fileName,
			});

			if (existingFile.length) {
				await fileHelper.deleteFile(existingFile[0].id);
				console.log(
					`Removed file from db: ${fileName} from project: ${projectName}`
				);
			}

			return;
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
		const directories = items.filter((item) => item.isDirectory());

		for (const dir of directories) {
			const projectName = dir.name;
			// const existingProject: any[] = await db.all(
			// 	'SELECT id FROM projects WHERE name = ?',
			// 	[projectName]
			// );
			const existingProject = await projectHelper.getProjects('id', {
				name: projectName,
			});

			let projectId: number;

			if (!existingProject.length) {
				// const { sql, values } = insertStatement('projects', {
				// 	name: projectName,
				// 	description: '',
				// 	ignore_files: JSON.stringify(DefaultIgnoreFiles),
				// 	created_at: new Date().toISOString(),
				// });
				// const { lastID } = await db.run(sql, values);
				// projectId = lastID;
				const project = await projectHelper.createProject(projectName);
				projectId = project.id;
				console.log(`Added project: ${projectName}`);
			} else {
				projectId = existingProject[0].id;
				console.log('Found existing project:', projectName);
			}

			await watchProjectFolder(projectId, projectName);
			await createFilesForProject(projectId, projectName);
			console.log('Scanned project:', projectName);
		}
	} catch (error) {
		console.error('Error scanning PROJECTS_ROOT:', error);
	}
}
