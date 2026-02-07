import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Project, Source, ProjectMetadata } from './types';

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
			projects.value[index].sourceCount = currentProject.value.sources.length;
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
		}
	}

	// Actions
	function createProject(name: string) {
		const newProject: Project = {
			id: crypto.randomUUID(),
			name,
			sources: [],
			options: { includeProjectFiles: true }
		};

		const metadata: ProjectMetadata = {
			id: newProject.id,
			name: newProject.name,
			sourceCount: 0,
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

	// Source Actions
	const activeSources = computed(() => {
		return currentProject.value?.sources.filter(s => s.enabled) || [];
	});

	const promptContent = computed(() => {
		if (!currentProject.value) return '';
		let content = '';

		// Add project files context if enabled
		if (currentProject.value.options.includeProjectFiles && currentProject.value.fileTree) {
			content += `### Project Files\n\`\`\`\n${currentProject.value.fileTree}\n\`\`\`\n\n`;
		}

		// Add active sources
		activeSources.value.forEach(source => {
			if (source.options?.useTitle !== false) {
				content += `### ${source.name}\n`;
			}

			if (source.options?.useTitle !== false) {
				content += `\`\`\`\n${source.content}\n\`\`\`\n\n`;
			} else {
				content += `${source.content}\n\n`;
			}
		});

		return content.trim();
	});

	function setProject(project: Project) {
		currentProject.value = project;
		saveCurrentProject();
	}

	function addSource(source: Source) {
		if (!currentProject.value) return;
		currentProject.value.sources.push(source);
		saveCurrentProject();
	}

	function removeSource(sourceId: string) {
		if (!currentProject.value) return;
		currentProject.value.sources = currentProject.value.sources.filter(s => s.id !== sourceId);
		saveCurrentProject();
	}

	function toggleSource(sourceId: string) {
		if (!currentProject.value) return;
		const source = currentProject.value.sources.find(s => s.id === sourceId);
		if (source) {
			source.enabled = !source.enabled;
			saveCurrentProject();
		}
	}

	function updateSource(source: Source) {
		if (!currentProject.value) return;
		const index = currentProject.value.sources.findIndex(s => s.id === source.id);
		if (index !== -1) {
			currentProject.value.sources[index] = source;
			saveCurrentProject();
		}
	}

	// Initialize
	loadProjectsList();

	return {
		projects,
		currentProject,
		activeSources,
		promptContent,
		createProject,
		deleteProject,
		loadProject,
		setProject,
		addSource,
		removeSource,
		toggleSource,
		updateSource
	};
});
