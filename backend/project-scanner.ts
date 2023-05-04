import fs from 'fs-extra';
import path from 'path';
import { Dirent } from 'fs';
import { db } from './db';
import {
	deleteStatement,
	insertStatement,
	updateStatement,
} from './db/sql-utils';
import { fileExists } from './fs-utils';
import { shouldIgnorePath, getProjectPath } from './path-utils';
import { DefaultIgnoreFiles } from './const';

async function createPromptPartsForProject(
	projectId: number,
	projectName: string,
	folderPath = ''
) {
	const projectPath = getProjectPath(projectName, folderPath);

	const project: any[] = await db.all(
		'SELECT ignore_files FROM projects WHERE id = ?',
		[projectId]
	);
	const ignoreFiles = project.length ? JSON.parse(project[0].ignore_files) : [];

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
			const existingPromptParts: any[] = await db.all(
				'SELECT id FROM prompt_parts WHERE project_id = ? AND name = ?',
				[projectId, itemPath]
			);

			if (!existingPromptParts.length) {
				const { sql, values } = insertStatement('prompt_parts', {
					project_id: projectId,
					name: itemPath,
					content: '',
					part_type: 'file',
					position: existingPromptParts.length,
					created_at: new Date(),
					updated_at: new Date(),
				});
				await db.run(sql, values);
				console.log(
					`Added prompt part: ${itemPath} in project: ${projectName}`
				);
			}
		} else if (item.isDirectory()) {
			await createPromptPartsForProject(projectId, projectName, itemPath);
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
			const existingPromptPart: any[] = await db.all(
				'SELECT id FROM prompt_parts WHERE project_id = ? AND name = ?',
				[projectId, fileName]
			);

			if (existingPromptPart.length) {
				const { sql, values } = deleteStatement('prompt_parts', {
					id: existingPromptPart[0].id,
				});
				await db.run(sql, values);
				console.log(
					`Removed prompt part: ${fileName} from project: ${projectName}`
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
			const existingProject: any[] = await db.all(
				'SELECT id FROM projects WHERE name = ?',
				[projectName]
			);

			let projectId: number;

			if (!existingProject.length) {
				const { sql, values } = insertStatement('projects', {
					name: projectName,
					description: '',
					ignore_files: JSON.stringify(DefaultIgnoreFiles),
					created_at: new Date(),
				});
				const { lastID } = await db.run(sql, values);
				projectId = lastID;
				console.log(`Added project: ${projectName}`);
			} else {
				projectId = existingProject[0].id;
				console.log('Found existing project:', projectName);
			}

			await watchProjectFolder(projectId, projectName);
			await createPromptPartsForProject(projectId, projectName);
			console.log('Scanned project:', projectName);
		}
	} catch (error) {
		console.error('Error scanning PROJECTS_ROOT:', error);
	}
}
