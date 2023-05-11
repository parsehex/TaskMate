import React, { useState } from 'react';
import { Project } from '../../types';
import ProjectSettingsModal from './ProjectSettingsModal';

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
	const [showSettingsModal, setShowSettingsModal] = useState(false);
	const selectedProject = projects.find(
		(project) => project.id === selectedProjectId
	);

	const handleEditProjectClick = () => {
		setShowSettingsModal(true);
	};

	const handleCloseSettingsModal = () => {
		setShowSettingsModal(false);
	};

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
			<label>
				Project:{' '}
				<select
					value={selectedProjectId || ''}
					onChange={handleProjectSelection}
				>
					<option value="">Select a project</option>
					{projects.map((project) => (
						<option key={project.id} value={project.id}>
							{project.name}
						</option>
					))}
				</select>
			</label>
			<button className="edit-project" onClick={handleEditProjectClick}>
				Edit Project
			</button>
			<ProjectSettingsModal
				project={selectedProject as Project}
				onClose={handleCloseSettingsModal}
				isOpen={showSettingsModal && !!selectedProject}
			/>
		</div>
	);
};

export default ProjectSelector;
