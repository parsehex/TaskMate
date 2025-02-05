import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
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

	const handleProjectSelection = (value: string) => {
		setSelectedProjectId(value);
		localStorage.setItem('selectedProjectId', value.toString());
	};

	return (
		<div className="flex items-center gap-2">
			<div className="flex-1">
				<Select
					value={selectedProjectId || ''}
					onValueChange={handleProjectSelection}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select a project" />
					</SelectTrigger>
					<SelectContent>
						{projects.map((project) => (
							<SelectItem key={project.id} value={project.id}>
								{project.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<Button variant="outline" onClick={() => setShowSettingsModal(true)}>
				Edit Project
			</Button>
			<ProjectSettingsModal
				isOpen={showSettingsModal && selectedProjectId !== null}
				onClose={() => setShowSettingsModal(false)}
			/>
		</div>
	);
};

export default ProjectSelector;
