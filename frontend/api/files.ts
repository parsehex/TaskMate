import { File } from '../../shared/types';
import FilesHandlers from '../ws/files';
import { convertBooleans } from './utils';

export const FileBooleanColumns = ['included', 'use_title', 'use_summary'];

export const fetchFiles = async (projectId?: number): Promise<File[]> => {
	const files = await FilesHandlers.GET_FILES(projectId);
	return files.map((file: any) => convertBooleans(file, FileBooleanColumns));
};

export const updateFile = async (
	id: number,
	data: Partial<File>
): Promise<File> => {
	const res = await FilesHandlers.UPDATE_FILE(id, data);
	return convertBooleans(res, FileBooleanColumns);
};
export const updateFiles = async (data: Partial<File>[]): Promise<File[]> => {
	const res = await FilesHandlers.UPDATE_FILES(data);
	return res.map((file: any) => convertBooleans(file, FileBooleanColumns));
};

export const createFile = async (
	projectId: number,
	newFile: Partial<File>
): Promise<File> => {
	const res = await FilesHandlers.CREATE_FILE(projectId, newFile.name!);
	return convertBooleans(res, FileBooleanColumns);
};

export const deleteFile = async (id: number): Promise<void> => {
	await FilesHandlers.DELETE_FILE(id);
};
