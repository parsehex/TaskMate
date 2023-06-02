import path from 'path';
import { minimatch } from 'minimatch';
import { db } from './db/index.js';

export function shouldIgnorePath(
	ignoreFiles: string[],
	itemPath: string
): boolean {
	// Check if any of the ignore patterns match the itemPath
	const shouldIgnore = ignoreFiles.some((ignorePattern) =>
		minimatch(itemPath, ignorePattern, { dot: true })
	);
	return shouldIgnore;
}

export function getProjectPath(projectName: string, folderPath = ''): string {
	if (!folderPath)
		return path.join(process.env.PROJECTS_ROOT as string, projectName);
	return path.join(
		process.env.PROJECTS_ROOT as string,
		projectName,
		folderPath
	);
}
export function getProjectPathLookup(
	project_id: number,
	folderPath = ''
): Promise<string> {
	return new Promise(async (resolve, reject) => {
		const project: any = await db.get(
			'SELECT name FROM projects WHERE id = ?',
			[project_id]
		);
		if (!project) reject('Project not found');
		const projectName = project.name;
		resolve(getProjectPath(projectName, folderPath));
	});
}
