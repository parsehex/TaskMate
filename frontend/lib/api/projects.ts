import { Project } from '@shared/types';
import ProjectsHandlers from '../ws/projects';

export const fetchProjects = async (): Promise<Project[]> => {
	return await ProjectsHandlers.GET_PROJECTS();
};

export const rescanProjects = async (): Promise<void> => {
	return await ProjectsHandlers.RESCAN_PROJECTS();
};

export const updateProject = async (
	id: string,
	data: Partial<Project>
): Promise<void> => {
	await ProjectsHandlers.UPDATE_PROJECT(id, data);
};

export const createProject = async (
	name: string,
	path: string,
	ignoredPaths?: string[] | string
): Promise<Project> => {
	return await ProjectsHandlers.CREATE_PROJECT(name, path, ignoredPaths);
};

export const deleteProject = async (id: string): Promise<void> => {
	await ProjectsHandlers.DELETE_PROJECT(id);
};
