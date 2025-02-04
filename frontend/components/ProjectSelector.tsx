import React, { useState } from 'react';
import { useStore } from '../state';
import ProjectSettingsModal from './ProjectSettingsModal';

const ProjectSelector: React.FC = () => {
	const [projects, selectedProjectId, setSelectedProjectId] = useStore(
		(state) => [
			state.projects,
			state.selectedProjectId,
			state.setSelectedProjectId,
		]
	);
	const [showSettingsModal, setShowSettingsModal] = useState(false);

	const handleProjectSelection = (
		event: React.ChangeEvent<HTMLSelectElement>
	) => {
		const projectId = event.target.value;
		setSelectedProjectId(projectId);

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
			<button
				className="edit-project"
				onClick={() => {
					setShowSettingsModal(true);
				}}
			>
				Edit Project
			</button>
			<ProjectSettingsModal
				isOpen={showSettingsModal && selectedProjectId !== null}
				onClose={() => {
					setShowSettingsModal(false);
				}}
			/>
		</div>
	);
};

export default ProjectSelector;
