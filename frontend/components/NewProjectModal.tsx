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

		// attempt to parse out the project name
		// TODO rethink. maybe have this as part of expanding to use a Browse button to choose folder
		//   (to fix issue with typing the path)
		// if (!name.trim()) {
		// 	let p = str.trim();
		// 	const slash = p.includes('/') ? '/' : '\\';
		// 	const firstIsSlash = p.indexOf(slash) === 0;
		// 	const lastIsSlash = p.lastIndexOf(slash) === p.length - 1;
		// 	if (firstIsSlash) p = p.slice(1);
		// 	if (lastIsSlash) p = p.slice(0, p.length - 1);
		// 	const lastSlash = p.lastIndexOf(slash);
		// 	const n = p.slice(lastSlash);
		// 	if (n) setName(n);
		// 	else return;
		// }
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
						<Input
							type="text"
							id="projectPath"
							value={path}
							onChange={(e) => handleSetPath(e.target.value.replace(/"/g, ''))}
							placeholder="Enter project path"
							autoFocus
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
