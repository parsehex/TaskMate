import { v4 } from 'uuid';
import fs from 'fs-extra';
import p from 'path';
import { Project } from '../../../shared/types/index.js';
import { db } from '../index.js';
import { insertStatement, updateStatement } from '../sql-utils.js';
import { getProjectPath } from '../../path-utils.js';
import { DefaultIgnoreFiles } from '../../../shared/const.js';

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
export const getProjectById = async (id: string, columns = '*') => {
	const project: Project = await db.get(
		`SELECT ${columns} FROM projects WHERE id = ?`,
		[id]
	);
	return project;
};
export const createProject = async ({ name, path, ...project }: Partial<Project> & {path:string}) => {
	if (!name) throw new Error('Project name is required');
	if (!path) throw new Error('Project path is required');
	try {
		const stat = await fs.stat(path);
		if (!stat.isDirectory()) throw new Error('Project path must be directory');
	} catch(e) {
		throw new Error('Project path must exist');
	}
	const projectPath = p.join(process.env.PROJECTS_ROOT as string, name);
	fs.createSymlink(path, projectPath);
	const id = v4();
	project.description = project.description || '';
	if (!project.ignore_files?.length) {
		project.ignore_files = JSON.stringify(DefaultIgnoreFiles);
	}
	const fieldsObj: Partial<Project> & { name: string } = {
		id,
		name,
		...project,
	};
	const { sql, values } = insertStatement('projects', fieldsObj);
	await db.run(sql, values);
	return (await db.get('SELECT * FROM projects WHERE id = ?', [
		id,
	])) as Project;
};
export const updateProject = async (id: string, project: Partial<Project>) => {
	const fieldsObj: Partial<Project> = {};
	if (project.name) fieldsObj.name = project.name;
	if (project.description) fieldsObj.description = project.description;
	if (project.ignore_files !== undefined)
		fieldsObj.ignore_files = project.ignore_files;
	const { sql, values } = updateStatement('projects', fieldsObj, { id });
	await db.run(sql, values);
	return (await db.get('SELECT * FROM projects WHERE id = ?', [id])) as Project;
};
export const deleteProject = async (id: string) => {
	return await db.run('DELETE FROM projects WHERE id = ?', [id]);
};
