import { Project } from '../../shared/types/index.js';
import { ProjectsMessageHandlers } from '../../shared/types/ws/index.js';
import * as helper from '../db/helper/projects.js';

async function GET_PROJECTS() {
	return await helper.getProjects();
}

async function CREATE_PROJECT(name: string) {
	return await helper.createProject({ name });
}

async function UPDATE_PROJECT(id: string, project: Partial<Project>) {
	return await helper.updateProject(id, project);
}

async function DELETE_PROJECT(id: string) {
	await helper.deleteProject(id);
}

const handlers: ProjectsMessageHandlers = {
	GET_PROJECTS,
	CREATE_PROJECT,
	UPDATE_PROJECT,
	DELETE_PROJECT,
};

export default handlers;
