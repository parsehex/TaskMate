import React, { useState } from 'react';
import { Project } from '../types';

interface ProjectSelectorProps {
	projects: Project[];
	selectedProjectId: number | null;
	setSelectedProjectId: (id: number) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
	projects,
	selectedProjectId,
	setSelectedProjectId,
}) => {
	const handleProjectSelection = (
		event: React.ChangeEvent<HTMLSelectElement>
	) => {
		const projectId = Number(event.target.value);
		setSelectedProjectId(projectId);

		// Store the selected project ID in localStorage
		localStorage.setItem('selectedProjectId', projectId.toString());
	};

	return (
		<div className="project-selector">
			<select value={selectedProjectId || ''} onChange={handleProjectSelection}>
				<option value="">Select a project</option>
				{projects.map((project) => (
					<option key={project.id} value={project.id}>
						{project.name}
					</option>
				))}
			</select>
			<button className="edit-project">Edit Project</button>
		</div>
	);
};

export default ProjectSelector;
