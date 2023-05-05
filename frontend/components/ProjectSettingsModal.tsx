import React, { useState, useEffect, useRef } from 'react';
import { Project } from '../types';
import { updateProject } from '../api';

interface ProjectSettingsModalProps {
	project: Project;
	onClose: () => void;
	isOpen: boolean;
}

const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
	project,
	onClose,
	isOpen,
}) => {
	const [description, setDescription] = useState(project?.description || '');
	const [ignoredPaths, setIgnoredPaths] = useState(project?.ignore_files || '');
	const dialog = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		setDescription(project?.description || '');
		setIgnoredPaths(project?.ignore_files || '');
	}, [project]);

	useEffect(() => {
		if (isOpen) {
			dialog.current?.showModal();
		} else {
			dialog.current?.close();
		}
	}, [isOpen]);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		await updateProject(project.id, {
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
