import path from 'path';
import { glob } from 'glob';
import { DefaultIgnoreFiles } from './const.js';

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
	return path.join(
		process.env.PROJECTS_ROOT as string,
		projectName,
		folderPath
	);
}
