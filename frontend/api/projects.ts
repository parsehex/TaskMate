import { Project } from '../../types';

export const fetchProjects = async (): Promise<Project[]> => {
	const response = await fetch('/api/projects');
	return await response.json();
};

export const updateProject = async (
	id: number,
	data: Partial<Project>
): Promise<void> => {
	const response = await fetch(`/api/projects/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const { error } = await response.json();
		throw new Error(error);
	}
};

// Other project-related functions...
