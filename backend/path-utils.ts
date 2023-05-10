import path from 'path';
import { glob } from 'glob';
import { DefaultIgnoreFiles } from './const.js';
import { db } from './db/index.js';

export async function shouldIgnorePath(
	ignoreFiles: string[],
	itemPath: string
): Promise<boolean> {
	const ignoreFileMatches = await Promise.all(
		ignoreFiles.map((ignoreFile) => glob(ignoreFile))
	);
	const ignoreFileMatchesFlat = ignoreFileMatches.flat();
	const shouldIgnore = ignoreFileMatchesFlat.some((ignoreFileMatch) =>
		itemPath.includes(ignoreFileMatch)
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
