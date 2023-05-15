import { File } from '../../types';
import { convertBooleans } from './utils';

const FileBooleanColumns = ['included', 'use_title', 'use_summary'];

export const fetchFiles = async (projectId?: number): Promise<File[]> => {
	const response = await fetch(`/api/files/${projectId ? `${projectId}` : ''}`);
	const files = await response.json();
	return files.map((file: any) => convertBooleans(file, FileBooleanColumns));
};

export const updateFile = async (
	id: number,
	data: Partial<File>
): Promise<File> => {
	const response = await fetch(`/api/files/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	if (!response.ok) {
		const { error } = await response.json();
		throw new Error(error);
	}
	const res = await response.json();
	return convertBooleans(res.data, FileBooleanColumns);
};
export const updateFiles = async (data: Partial<File>[]): Promise<File[]> => {
	const newFiles: File[] = [];
	for (const file of data) {
		newFiles.push(await updateFile(file.id!, file));
	}
	return newFiles;
};

export const createFile = async (
	projectId: number,
	newFile: Partial<File>
): Promise<File> => {
	const response = await fetch(`/api/files`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			...newFile,
			project_id: projectId,
		}),
	});
	if (!response.ok) {
		const { error } = await response.json();
		throw new Error(error);
	}
	const res = await response.json();
	return convertBooleans(res.data, FileBooleanColumns);
};

export const deleteFile = async (id: number): Promise<void> => {
	const response = await fetch(`/api/files/${id}`, {
		method: 'DELETE',
	});
	if (!response.ok) {
		const { error } = await response.json();
		throw new Error(error);
	}
};
