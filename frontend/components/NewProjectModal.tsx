import React, { useState } from 'react';
import { fetchProjects, createProject } from '@/lib/api/projects';
import { useStore } from '../state';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DefaultIgnoreFiles } from '@shared/const';

const isElectron = !!(window as any).electron;

interface NewProjectModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({
	isOpen,
	onClose,
}) => {
	const [name, setName] = useState('');
	const [path, setPath] = useState('');
	const [ignoredPaths, setIgnoredPaths] = useState(
		JSON.stringify(DefaultIgnoreFiles, null, 2)
	);
	const setProjects = useStore((state) => state.setProjects);
	const setSelectedProjectId = useStore((state) => state.setSelectedProjectId);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const hasName = !!name.trim();
		const hasPath = !!path.trim();
		if (!hasName && !hasPath) return;

		try {
			const paths = JSON.stringify(JSON.parse(ignoredPaths));
			const newProject = await createProject(
				name.trim(),
				path.trim(),
				paths.trim()
			);
			const updatedProjects = await fetchProjects();
			setProjects(updatedProjects);
			setSelectedProjectId(newProject.id);
			localStorage.setItem('selectedProjectId', newProject.id);
			onClose();
		} catch (error) {
			console.error('Failed to create project:', error);
		}
	};

	const handleSetPath = (str: string) => {
		if (!str) return;
		setPath(str);
	};

	const handleBrowseFolder = async () => {
		try {
			const selectedPath = await window.electron.selectFolder();
			if (selectedPath) {
				setPath(selectedPath);
				// Auto-populate project name from folder name if not already set
				if (!name.trim()) {
					const folderName = selectedPath.split(/[/\\]/).pop() || '';
					if (folderName) setName(folderName);
				}
			}
		} catch (error) {
			console.error('Failed to select folder:', error);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-md bg-gray-200">
				<DialogHeader>
					<DialogTitle>Add a Project</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="projectName" className="text-sm font-medium">
							Project Name
						</label>
						<Input
							type="text"
							id="projectName"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Enter project name"
						/>
					</div>
					<div>
						<label htmlFor="projectPath" className="text-sm font-medium">
							Existing Project Path (optional)
						</label>
						<div className="flex gap-2">
							<Input
								type="text"
								id="projectPath"
								value={path}
								onChange={(e) => handleSetPath(e.target.value.replace(/"/g, ''))}
								placeholder="Enter project path"
								autoFocus
								className="flex-1"
							/>
							{ isElectron && (
								<Button
									type="button"
									variant="secondary"
									onClick={handleBrowseFolder}
								>
									Browse
								</Button>
							)}
						</div>
					</div>
					<div className="space-y-2">
						<label htmlFor="ignoredPaths" className="text-sm font-medium">
							Ignored Paths
						</label>
						<Textarea
							id="ignoredPaths"
							value={ignoredPaths}
							onChange={(e) => setIgnoredPaths(e.target.value)}
							placeholder='e.g., ["node_modules/", "dist/", ".git/"]'
							className="w-full min-h-28"
						/>
					</div>
					<DialogFooter className="flex justify-end space-x-2">
						<Button type="button" variant="ghost" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit">Create</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default NewProjectModal;
