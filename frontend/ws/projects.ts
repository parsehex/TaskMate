import { Project } from '../../shared/types';
import { ProjectsMessageHandlers } from '../../shared/types/ws';
import { getSession } from '.';

async function GET_PROJECTS() {
	const session = getSession();
	return (await session.call('GET_PROJECTS', [])) as Project[];
}
async function CREATE_PROJECT(name: string) {
	const session = getSession();
	return (await session.call('CREATE_PROJECT', [name])) as Project;
}
async function UPDATE_PROJECT(id: number, project: Partial<Project>) {
	const session = getSession();
	return (await session.call('UPDATE_PROJECT', [id, project])) as Project;
}
async function DELETE_PROJECT(id: number) {
	const session = getSession();
	return (await session.call('DELETE_PROJECT', [id])) as void;
}

const ProjectsHandlers: ProjectsMessageHandlers = {
	GET_PROJECTS,
	CREATE_PROJECT,
	UPDATE_PROJECT,
	DELETE_PROJECT,
};

export default ProjectsHandlers;
