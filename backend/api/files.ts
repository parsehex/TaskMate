import fs from 'fs-extra';
import { File } from '../../shared/types/index.js';
import { FilesMessageHandlers } from '../../shared/types/ws/index.js';
import * as helper from '../db/helper/files.js';
import { getProjectPathLookup } from '../path-utils.js';
import path from 'path';
import { GET_TOKEN_COUNT } from './utils.js';

async function resolveFileContent(file: File) {
	const p = await getProjectPathLookup(file.project_id, file.name);
	if (!(await fs.pathExists(p))) return { drop: true };
	const content = await fs.readFile(p, 'utf-8');
	const token_count = await GET_TOKEN_COUNT({ fileId: file.id });
	return { ...file, content, token_count };
}

async function GET_FILE(id: string): Promise<File> {
	const file = await helper.getFileById(id);
	if (!file) {
		throw new Error(`File with id ${id} not found`);
	}
	const obj = await resolveFileContent(file);
	if (obj.drop) {
		throw new Error(`File with id ${id} not found`);
	}
	return obj as File;
}

async function GET_FILES(project_id: string | undefined): Promise<File[]> {
	const files = project_id
		? await helper.getFilesByProjectId(project_id)
		: await helper.getFiles();
	return Promise.all(files.map(resolveFileContent)).then((files) =>
		files.filter((file) => !file.drop)
	) as Promise<File[]>;
}

async function CREATE_FILE(project_id: string, name: string): Promise<File> {
	const p = await getProjectPathLookup(project_id, name);
	if (await fs.pathExists(p)) {
		throw new Error('File already exists');
	}
	const file = await helper.createFile(project_id, { name });
	await fs.writeFile(p, '');
	return file;
}

async function UPDATE_FILE(id: string, file: Partial<File>): Promise<File> {
	let updatedFile = await helper.updateFile(id, file);
	const projectPath = await getProjectPathLookup(
		updatedFile.project_id,
		file.name
	);

	if (file.name && !(await fs.pathExists(projectPath))) {
		throw new Error('File does not exist');
	}

	if (file.name && file.name !== updatedFile.name) {
		const basePath = await getProjectPathLookup(updatedFile.project_id);
		const oldPath = path.join(basePath, updatedFile.name);
		const newPath = path.join(basePath, file.name);
		await fs.rename(oldPath, newPath);
	}

	if (file.content) await fs.writeFile(projectPath, file.content);
	else updatedFile = (await resolveFileContent(updatedFile)) as File;

	return updatedFile;
}

async function UPDATE_FILES(files: Partial<File>[]): Promise<File[]> {
	const updatedFiles = await helper.updateFiles(files);

	for (let i = 0; i < updatedFiles.length; i++) {
		const file = updatedFiles[i];
		const projectPath = await getProjectPathLookup(file.project_id, file.name);
		if (file.name && !(await fs.pathExists(projectPath))) {
			throw new Error('File does not exist');
		}
		if (file.name && file.name !== file.name) {
			const basePath = await getProjectPathLookup(file.project_id);
			const oldPath = path.join(basePath, file.name);
			const newPath = path.join(basePath, file.name);
			await fs.rename(oldPath, newPath);
		}
		let updatedFile: File | undefined;
		if (file.content) await fs.writeFile(projectPath, file.content);
		else updatedFile = (await resolveFileContent(file)) as File;
		if (updatedFile) updatedFiles[i] = updatedFile;
	}
	return updatedFiles;
}

async function DELETE_FILE(id: string): Promise<void> {
	await helper.deleteFile(id);
}

const handlers: FilesMessageHandlers = {
	GET_FILE,
	GET_FILES,
	CREATE_FILE,
	DELETE_FILE,
	UPDATE_FILE,
	UPDATE_FILES,
};

export default handlers;
