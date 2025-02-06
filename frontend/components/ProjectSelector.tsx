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
import NewProjectModal from './NewProjectModal';
import ScanProjectsButton from './ScanProjectsButton';

const ProjectSelector: React.FC = () => {
	const [projects, selectedProjectId, setSelectedProjectId] = useStore(
		(state) => [
			state.projects,
			state.selectedProjectId,
			state.setSelectedProjectId,
		]
	);
	const [showSettingsModal, setShowSettingsModal] = useState(false);
	const [showNewProjectModal, setShowNewProjectModal] = useState(false);

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
					<SelectTrigger
						data-tooltip-id="previewButton"
						data-tooltip-html="Projects"
						data-tooltip-delay-show={250}
					>
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
			<Button
				variant="outline"
				size="xs"
				onClick={() => setShowSettingsModal(true)}
			>
				Edit
			</Button>
			<Button
				variant="default"
				size="xs"
				onClick={() => setShowNewProjectModal(true)}
			>
				Add
			</Button>
			<ScanProjectsButton />
			<ProjectSettingsModal
				isOpen={showSettingsModal && selectedProjectId !== null}
				onClose={() => setShowSettingsModal(false)}
			/>
			<NewProjectModal
				isOpen={showNewProjectModal}
				onClose={() => setShowNewProjectModal(false)}
			/>
		</div>
	);
};

export default ProjectSelector;
