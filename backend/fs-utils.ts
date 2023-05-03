import fs from 'fs-extra';

export async function fileExists(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}

export async function readFileContents(filePath: string): Promise<string> {
	try {
		const fileContents = await fs.readFile(filePath, {
			encoding: 'utf8',
		});
		return fileContents;
	} catch {
		return '';
	}
}

export async function writeFileContents(
	filePath: string,
	content: string
): Promise<void> {
	try {
		await fs.writeFile(filePath, content, {
			encoding: 'utf8',
		});
	} catch (e: any) {}
}

export async function deleteFile(filePath: string): Promise<void> {
	try {
		await fs.unlink(filePath);
	} catch (e: any) {}
}

export async function renameFile(
	oldPath: string,
	newPath: string
): Promise<void> {
	try {
		await fs.rename(oldPath, newPath);
	} catch (e: any) {}
}
