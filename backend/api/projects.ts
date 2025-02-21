import { Project } from '../../shared/types/index.js';
import { ProjectsMessageHandlers } from '../../shared/types/ws/index.js';
import * as helper from '../db/helper/projects.js';
import { scanProjectsRoot } from '../project-scanner.js';

async function GET_PROJECTS() {
	return await helper.getProjects();
}

async function CREATE_PROJECT(name: string, path: string, ignoredPaths?: string[] | string) {
	const data: Partial<Project> & { path: string } = { name, path }
	if (ignoredPaths && Array.isArray(ignoredPaths)) data.ignore_files = JSON.stringify(ignoredPaths);
	return await helper.createProject(data);
}

async function UPDATE_PROJECT(id: string, project: Partial<Project>) {
	return await helper.updateProject(id, project);
}

async function DELETE_PROJECT(id: string) {
	await helper.deleteProject(id);
}

async function RESCAN_PROJECTS() {
	await scanProjectsRoot();
}

const handlers: ProjectsMessageHandlers = {
	GET_PROJECTS,
	RESCAN_PROJECTS,
	CREATE_PROJECT,
	UPDATE_PROJECT,
	DELETE_PROJECT,
};

export default handlers;
