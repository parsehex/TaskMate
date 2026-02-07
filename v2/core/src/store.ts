import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Project, PromptPart, ProjectMetadata } from './types';

export const useProjectStore = defineStore('project', () => {
	// State
	const projects = ref<ProjectMetadata[]>([]);
	const currentProject = ref<Project | null>(null);

	// Persistence Helpers
	const STORAGE_KEY_PREFIX = 'taskmate_project_';
	const PROJECTS_LIST_KEY = 'taskmate_projects_list';

	function saveProjectsList() {
		localStorage.setItem(PROJECTS_LIST_KEY, JSON.stringify(projects.value));
	}

	function saveCurrentProject() {
		if (!currentProject.value) return;
		localStorage.setItem(STORAGE_KEY_PREFIX + currentProject.value.id, JSON.stringify(currentProject.value));

		// Update metadata
		const index = projects.value.findIndex(p => p.id === currentProject.value!.id);
		if (index !== -1) {
			projects.value[index].partCount = currentProject.value.promptParts.length;
			projects.value[index].updatedAt = Date.now();
			saveProjectsList();
		}
	}

	function loadProjectsList() {
		const raw = localStorage.getItem(PROJECTS_LIST_KEY);
		if (raw) {
			projects.value = JSON.parse(raw);
		}
	}

	function loadProject(projectId: string) {
		const raw = localStorage.getItem(STORAGE_KEY_PREFIX + projectId);
		if (raw) {
			currentProject.value = JSON.parse(raw);
			// Migration check (basic)
			if ((currentProject.value as any).sources && !currentProject.value?.promptParts) {
				currentProject.value!.promptParts = (currentProject.value as any).sources;
				delete (currentProject.value as any).sources;
			}
		}
	}

	// Actions
	function createProject(name: string) {
		const newProject: Project = {
			id: crypto.randomUUID(),
			name,
			promptParts: [],
			options: { includeProjectFiles: true }
		};

		const metadata: ProjectMetadata = {
			id: newProject.id,
			name: newProject.name,
			partCount: 0,
			updatedAt: Date.now()
		};

		projects.value.push(metadata);
		currentProject.value = newProject;

		saveProjectsList();
		saveCurrentProject();
	}

	function deleteProject(projectId: string) {
		projects.value = projects.value.filter(p => p.id !== projectId);
		localStorage.removeItem(STORAGE_KEY_PREFIX + projectId);
		saveProjectsList();

		if (currentProject.value?.id === projectId) {
			currentProject.value = null;
		}
	}

	// Prompt Part Actions
	const activePromptParts = computed(() => {
		return currentProject.value?.promptParts.filter(s => s.enabled) || [];
	});

	const promptContent = computed(() => {
		if (!currentProject.value) return '';

		const parts: string[] = [];

		// Add active prompt parts
		// We use a clean loop to ensure all parts are processed
		for (const part of activePromptParts.value) {
			let partContent = '';
			if (part.meta?.isProjectFiles) {
				// Special handling for Project Files title/formatting if needed, or just standard
				partContent += `Project Files:\n\`\`\`\n${part.content}\n\`\`\``;
			} else if (part.options?.useTitle !== false) {
				partContent += `\`${part.name}\`:\n`;
				partContent += `\`\`\`\n${part.content}\n\`\`\``;
			} else {
				partContent += part.content;
			}
			parts.push(partContent);
		}

		return parts.join('\n\n');
	});

	function setProject(project: Project) {
		currentProject.value = project;
		saveCurrentProject();
	}

	function addPromptPart(part: PromptPart) {
		if (!currentProject.value) return;
		currentProject.value.promptParts.push(part);
		saveCurrentProject();
	}

	function removePromptPart(partId: string) {
		if (!currentProject.value) return;
		currentProject.value.promptParts = currentProject.value.promptParts.filter(s => s.id !== partId);
		saveCurrentProject();
	}

	function togglePromptPart(partId: string) {
		if (!currentProject.value) return;
		const part = currentProject.value.promptParts.find(s => s.id === partId);
		if (part) {
			part.enabled = !part.enabled;
			saveCurrentProject();
		}
	}

	function updatePromptPart(part: PromptPart) {
		if (!currentProject.value) return;
		const index = currentProject.value.promptParts.findIndex(s => s.id === part.id);
		if (index !== -1) {
			currentProject.value.promptParts[index] = part;
			saveCurrentProject();
		}
	}


	function movePromptPart(fromIndex: number, toIndex: number) {
		if (!currentProject.value) return;
		const parts = currentProject.value.promptParts;
		if (fromIndex < 0 || fromIndex >= parts.length || toIndex < 0 || toIndex >= parts.length) return;

		const [movedPart] = parts.splice(fromIndex, 1);
		parts.splice(toIndex, 0, movedPart);
		saveCurrentProject();
	}

	function updateProject(updates: Partial<Project>) {
		if (!currentProject.value) return;
		Object.assign(currentProject.value, updates);

		// If fileTree is updated, sync it to the Project Files part
		if (updates.fileTree !== undefined) {
			// Handle Project Files Snippet
			// First, capture the state of any existing Project Files part
			const existingPart = currentProject.value.promptParts.find(p => p.meta?.isProjectFiles);
			const wasEnabled = existingPart ? existingPart.enabled : currentProject.value.options.includeProjectFiles;

			// Remove ALL existing Project Files parts to prevent duplicates
			currentProject.value.promptParts = currentProject.value.promptParts.filter(p => !p.meta?.isProjectFiles);

			// If we have content, add the part back
			if (updates.fileTree.trim()) {
				currentProject.value.promptParts.push({
					id: existingPart?.id || crypto.randomUUID(), // Keep ID if possible to preserve selection state in UI
					type: 'snippet',
					name: 'Project Files',
					content: updates.fileTree,
					enabled: wasEnabled,
					meta: { isProjectFiles: true },
					options: { useTitle: false } // Project Files usually have their own header in content
				});
			}
		}

		saveCurrentProject();
	}

	// Initialize
	loadProjectsList();

	return {
		projects,
		currentProject,
		activePromptParts,
		promptContent,
		createProject,
		deleteProject,
		loadProject,
		setProject,
		updateProject,
		addPromptPart,
		removePromptPart,
		togglePromptPart,
		updatePromptPart,
		movePromptPart
	};
});
