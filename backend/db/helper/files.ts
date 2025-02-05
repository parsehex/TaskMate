import { v4 } from 'uuid';
import { File } from '../../../shared/types/index.js';
import { db } from '../index.js';
import { insertStatement, updateStatement } from '../sql-utils.js';

export const getFiles = async (
	columns = '*',
	where: Record<string, any> = {}
): Promise<File[]> => {
	let sql = `SELECT ${columns} FROM files`;
	const values: any[] = [];
	if (Object.keys(where).length) {
		sql += ' WHERE ';
		sql += Object.keys(where)
			.map((key) => {
				values.push(where[key]);
				return `${key} = ?`;
			})
			.join(' AND ');
	}
	return await db.all(sql, values);
};

export const getFilesByProjectId = async (
	project_id: string,
	columns = '*'
): Promise<File[]> => {
	return await db.all(`SELECT ${columns} FROM files WHERE project_id = ?`, [
		project_id,
	]);
};

export const getFileById = async (id: string, columns = '*'): Promise<File> => {
	return await db.get(`SELECT ${columns} FROM files WHERE id = ?`, [id]);
};

export const updateFile = async (
	id: string,
	file: Partial<File>
): Promise<File> => {
	const fieldsObj: Partial<File> = {
		updated_at: new Date().toISOString(),
		...file,
	};
	if (file.id) delete fieldsObj.id;
	if (file.content) delete fieldsObj.content;
	const { sql, values } = updateStatement('files', fieldsObj, { id });
	await db.run(sql, values);
	return await getFileById(id);
};

export const updateFiles = async (files: Partial<File>[]): Promise<File[]> => {
	const updatedFiles: File[] = [];

	await db.run('BEGIN TRANSACTION');

	try {
		for (const file of files) {
			if (!file.id) continue;
			const fieldsObj: Partial<File> = {
				updated_at: new Date().toISOString(),
				...file,
			};
			if (file.content) delete fieldsObj.content;
			const { sql, values } = updateStatement('files', fieldsObj, {
				id: file.id,
			});
			await db.run(sql, values);
			updatedFiles.push(await getFileById(file.id));
		}
		await db.run('COMMIT');
	} catch (e) {
		await db.run('ROLLBACK');
		throw e;
	}

	return updatedFiles;
};

export const createFile = async (
	project_id: string,
	file: Partial<File>
): Promise<File> => {
	const id = v4();
	const { sql, values } = insertStatement('files', {
		...file,
		id,
		project_id,
		updated_at: new Date().toISOString(),
	});
	if (file.id) delete file.id;
	if (file.content) delete file.content;
	await db.run(sql, values);
	return await getFileById(id);
};

export const deleteFile = async (id: string): Promise<void> => {
	await db.run('DELETE FROM files WHERE id = ?', [id]);
};
