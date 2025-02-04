import path from 'path';
import fs from 'fs-extra';
import { minimatch } from 'minimatch';
import { db } from './db/index.js';
import { getProjectById } from './db/helper/projects.js';

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

const pathCache: { [key: string]: string } = {};

export async function getProjectPath(
	project: {id?: string, name?: string} | string,
	folderPath = ''
): Promise<string> {
	if (typeof project === 'string') project = { name: project };
	const hasID = !!project.id;
	const hasName = !!project.name;
	if (!hasID && !hasName) {
		throw new Error(`Must pass project ID or name, received ${typeof (project)}`);
	}

	if (hasID && !hasName) {
		const n = await getProjectById(project.id as string);
		if (n) project.name = n.name;
		else throw new Error(`Couldn't find project with id ${project.id}`);
	}

	const projectName = project.name as string;

	if (pathCache[projectName]) {
		return folderPath
			? path.join(pathCache[projectName], folderPath)
			: pathCache[projectName];
	}

	let base = path.join(process.env.PROJECTS_ROOT as string, projectName);
	const stat = await fs.stat(base);

	if (stat.isSymbolicLink()) {
		base = await fs.realpath(base);
	}

	pathCache[projectName] = base; // Add to cache

	if (!folderPath) return base;
	return path.join(base, folderPath);
}
export function getProjectPathLookup(
	project_id: string,
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
