import React, { useState, useEffect, useRef } from 'react';
import { Project } from '../../shared/types';
import { updateProject } from '../api/projects';
import { useStore } from '../state';

interface ProjectSettingsModalProps {
	onClose: () => void;
	isOpen: boolean;
}

const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
	onClose,
	isOpen,
}) => {
	const [projects, selectedProjectId] = useStore((state) => [
		state.projects,
		state.selectedProjectId,
	]);
	let selectedProject: Project | undefined;
	const findSelectedProject = () => {
		selectedProject = projects.find(
			(project) => project.id === selectedProjectId
		);
	};
	findSelectedProject();
	const [description, setDescription] = useState(
		selectedProject?.description || ''
	);
	const [ignoredPaths, setIgnoredPaths] = useState(
		selectedProject?.ignore_files || ''
	);
	const dialog = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		setDescription(selectedProject?.description || '');
		setIgnoredPaths(selectedProject?.ignore_files || '');
	}, [selectedProject]);

	useEffect(() => {
		if (isOpen && selectedProject) {
			dialog.current?.showModal();
		} else {
			dialog.current?.close();
		}
	}, [isOpen]);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!selectedProject) return;
		await updateProject(selectedProject.id, {
			description,
			ignore_files: ignoredPaths,
		});
		onClose();
	};

	return (
		<dialog ref={dialog}>
			<form onSubmit={handleSubmit}>
				<h2>Edit Project</h2>
				<label htmlFor="description">Description</label>
				<textarea
					id="description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
				/>
				<label htmlFor="ignoredPaths">Ignored Paths</label>
				<input
					type="text"
					id="ignoredPaths"
					value={ignoredPaths}
					onChange={(e) => setIgnoredPaths(e.target.value)}
				/>
				<div>
					<button type="submit">Save</button>
					<button type="button" onClick={onClose}>
						Cancel
					</button>
				</div>
			</form>
		</dialog>
	);
};

export default ProjectSettingsModal;
