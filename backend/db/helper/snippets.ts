import { Snippet } from '../../../types/index.js';
import { db } from '../index.js';
import { insertStatement, updateStatement } from '../sql-utils.js';

export const getSnippets = async (
	columns = '*',
	where: Record<string, any> = {}
): Promise<Snippet[]> => {
	let sql = `SELECT ${columns} FROM snippets`;
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

export const getSnippetsByProjectId = async (
	project_id: number,
	columns = '*'
): Promise<Snippet[]> => {
	return await getSnippets(columns, { project_id });
};

export const getSnippetById = async (
	id: number,
	columns = '*'
): Promise<Snippet> => {
	return await db.get(`SELECT ${columns} FROM snippets WHERE id = ?`, [id]);
};

export const updateSnippet = async (
	id: number,
	snippet: Partial<Snippet>
): Promise<Snippet> => {
	const fieldsObj: Partial<Snippet> = {
		updated_at: new Date().toISOString(),
		...snippet,
	};
	if (snippet.id) delete fieldsObj.id;

	const { sql, values } = updateStatement('snippets', fieldsObj, { id });
	await db.run(sql, values);
	return await getSnippetById(id);
};

export const createSnippet = async (
	project_id: number,
	snippet: Partial<Snippet>
): Promise<Snippet> => {
	const { sql, values } = insertStatement('snippets', {
		...snippet,
		project_id,
		updated_at: new Date().toISOString(),
	});
	if (snippet.id) delete snippet.id;
	const result = await db.run(sql, values);
	return await getSnippetById(result.lastID);
};

export const deleteSnippet = async (id: number): Promise<void> => {
	await db.run('DELETE FROM snippets WHERE id = ?', [id]);
};
