import React, { useState, useEffect } from 'react';
import { updateProject } from '../api/projects';
import { useStore } from '../state';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

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
	const selectedProject = projects.find(
		(project) => project.id === selectedProjectId
	);

	const [description, setDescription] = useState(
		selectedProject?.description || ''
	);
	const [ignoredPaths, setIgnoredPaths] = useState(
		JSON.stringify(
			JSON.parse(selectedProject?.ignore_files || '[]'),
			null,
			2
		) || ''
	);

	useEffect(() => {
		if (selectedProject) {
			setDescription(selectedProject.description || '');
			setIgnoredPaths(
				JSON.stringify(
					JSON.parse(selectedProject?.ignore_files || '[]'),
					null,
					2
				) || ''
			);
		}
	}, [selectedProject, isOpen]);

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
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-lg bg-gray-200">
				<DialogHeader>
					<DialogTitle>Edit Project</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<label htmlFor="description" className="text-sm font-medium">
							Description
						</label>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Enter project description..."
							className="w-full"
						/>
					</div>
					<div className="space-y-2">
						<label htmlFor="ignoredPaths" className="text-sm font-medium">
							Ignored Paths
						</label>
						<Textarea
							id="ignoredPaths"
							value={ignoredPaths}
							onChange={(e) => setIgnoredPaths(e.target.value)}
							placeholder="e.g., node_modules/, dist/, .git/"
							className="w-full min-h-28"
						/>
					</div>
					<DialogFooter className="flex justify-end space-x-2">
						<Button type="button" variant="ghost" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit">Save</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default ProjectSettingsModal;
