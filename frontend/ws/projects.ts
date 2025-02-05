import { Project } from '../../shared/types';
import { ProjectsMessageHandlers } from '../../shared/types/ws';
import { call } from '.';

async function GET_PROJECTS() {
	return (await call('GET_PROJECTS', [])) as Project[];
}
async function CREATE_PROJECT(name: string, path: string) {
	return (await call('CREATE_PROJECT', [name, path])) as Project;
}
async function UPDATE_PROJECT(id: string, project: Partial<Project>) {
	return (await call('UPDATE_PROJECT', [id, project])) as Project;
}
async function DELETE_PROJECT(id: string) {
	return (await call('DELETE_PROJECT', [id])) as void;
}

const ProjectsHandlers: ProjectsMessageHandlers = {
	GET_PROJECTS,
	CREATE_PROJECT,
	UPDATE_PROJECT,
	DELETE_PROJECT,
};

export default ProjectsHandlers;
