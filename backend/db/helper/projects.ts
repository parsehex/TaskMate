import { Project } from '../../../shared/types/index.js';
import { db } from '../index.js';
import { updateStatement } from '../sql-utils.js';

export const getProjects = async (
	columns = '*',
	where: Record<string, any> = {}
): Promise<Project[]> => {
	let sql = `SELECT ${columns} FROM projects`;
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
export const getProjectById = async (id: number, columns = '*') => {
	const project: Project = await db.get(
		`SELECT ${columns} FROM projects WHERE id = ?`,
		[id]
	);
	return project;
};
export const createProject = async (name: string) => {
	const q = await db.run('INSERT INTO projects (name) VALUES (?)', [name]);
	return (await db.get('SELECT * FROM projects WHERE id = ?', [
		q.lastID,
	])) as Project;
};
export const updateProject = async (id: number, project: Partial<Project>) => {
	const fieldsObj: Partial<Project> = {};
	if (project.name) fieldsObj.name = project.name;
	if (project.description) fieldsObj.description = project.description;
	if (project.ignore_files !== undefined)
		fieldsObj.ignore_files = project.ignore_files;
	const { sql, values } = updateStatement('projects', fieldsObj, { id });
	await db.run(sql, values);
	return (await db.get('SELECT * FROM projects WHERE id = ?', [id])) as Project;
};
export const deleteProject = async (id: number) => {
	return await db.run('DELETE FROM projects WHERE id = ?', [id]);
};
