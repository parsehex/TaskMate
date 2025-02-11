import { v4 } from 'uuid';
import { Snippet } from '../../../shared/types/index.js';
import { db } from '../index.js';
import { insertStatement, updateStatement } from '../sql-utils.js';
import * as projectHelper from './projects.js';
import { loadFileSnippets } from '../../file-snippets.js';
import { getProjectPath } from '../../path-utils.js';

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
	sql += ' ORDER BY position ASC';
	return await db.all(sql, values);
};

export const getSnippetsByProjectId = async (
	project_id: string,
	columns = '*'
): Promise<Snippet[]> => {
	const dbSnippets = await getSnippets('*', { project_id });
	const fileSnippets = await loadFileSnippets(
		project_id,
		await getProjectPath({ id: project_id })
	);

	return [...dbSnippets, ...fileSnippets];
};

export const getSnippetById = async (
	id: string,
	columns = '*'
): Promise<Snippet> => {
	return await db.get(
		`SELECT ${columns} FROM snippets WHERE id = ? ORDER BY position ASC`,
		[id]
	);
};

export const updateSnippet = async (
	id: string,
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
	project_id: string,
	snippet: Partial<Snippet>
): Promise<Snippet> => {
	const id = v4();
	const { sql, values } = insertStatement('snippets', {
		...snippet,
		id,
		project_id,
		updated_at: new Date().toISOString(),
	});
	if (snippet.id) delete snippet.id;
	await db.run(sql, values);
	return await getSnippetById(id);
};

export const deleteSnippet = async (id: string): Promise<void> => {
	await db.run('DELETE FROM snippets WHERE id = ?', [id]);
};
