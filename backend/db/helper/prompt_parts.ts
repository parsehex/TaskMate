import { Prompt_Part } from '../../../types/index.js';
import { db } from '../index.js';
import { insertStatement, updateStatement } from '../sql-utils.js';
import { getProjectPath } from '../../path-utils.js';
import { readFileContents } from '../../fs-utils.js';

const resolveFileContent = async (promptPart: Prompt_Part) => {
	if (promptPart.part_type !== 'file') return promptPart;
	const project_id = promptPart.project_id;
	const project: any = await db.get('SELECT name FROM projects WHERE id = ?', [
		project_id,
	]);
	const p = getProjectPath(project.name, promptPart.name);
	promptPart.content = await readFileContents(p);
	return promptPart;
};

export const getPromptParts = async () => {
	const promptParts: Prompt_Part[] = await db.all('SELECT * FROM prompt_parts');
	return Promise.all(promptParts.map(resolveFileContent));
};
export const getPromptPartsByProjectId = async (project_id: number) => {
	const promptParts: Prompt_Part[] = await db.all(
		'SELECT * FROM prompt_parts WHERE project_id = ?',
		[project_id]
	);
	return Promise.all(promptParts.map(resolveFileContent));
};
export const getPromptPartById = async (partId: number) => {
	const promptPart: Prompt_Part = await db.get(
		'SELECT * FROM prompt_parts WHERE id = ?',
		[partId]
	);
	return resolveFileContent(promptPart);
};
export const updatePromptPart = async (
	id: number,
	part: Partial<Prompt_Part>
) => {
	const fieldsObj: Partial<Prompt_Part> = {
		updated_at: new Date() as any,
	};
	for (let field of Object.keys(part)) {
		// @ts-ignore
		if (field in part) fieldsObj[field] = part[field];
	}
	const { sql, values } = updateStatement('prompt_parts', fieldsObj, { id });
	await db.run(sql, values);
	return (await db.get('SELECT * FROM prompt_parts WHERE id = ?', [
		id,
	])) as Prompt_Part;
};
export const createPromptPart = async (
	project_id: number,
	part: Partial<Prompt_Part>
) => {
	const { sql, values } = insertStatement('prompt_parts', {
		...part,
		project_id,
	});
	const result = await db.run(sql, values);
	return (await db.get('SELECT * FROM prompt_parts WHERE id = ?', [
		result.lastID,
	])) as Prompt_Part;
};
export const deletePromptPart = async (id: number) => {
	return await db.run('DELETE FROM prompt_parts WHERE id = ?', [id]);
};

export const sortPromptParts = async (project_id: number) => {
	let promptParts: Prompt_Part[] = await db.all(
		'SELECT * FROM prompt_parts WHERE project_id = ?',
		[project_id]
	);

	promptParts.sort((a, b) => {
		if (a.part_type === 'snippet' && b.part_type === 'file') return -1;
		if (a.part_type === 'file' && b.part_type === 'snippet') return 1;

		return a.position - b.position;
	});

	// Update positions in the database
	for (let i = 0; i < promptParts.length; i++) {
		const part = promptParts[i];
		if (part.position !== i) {
			await updatePromptPart(part.id, { position: i });
		}
	}
};
