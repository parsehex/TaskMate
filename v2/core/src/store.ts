import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Project, Source } from './types';

export const useProjectStore = defineStore('project', () => {
	const currentProject = ref<Project | null>(null);

	const activeSources = computed(() => {
		return currentProject.value?.sources.filter(s => s.enabled) || [];
	});

	const promptContent = computed(() => {
		if (!currentProject.value) return '';
		let content = '';

		// Add project files context if enabled
		if (currentProject.value.options.includeProjectFiles && currentProject.value.fileTree) {
			content += `<project_files>\n${currentProject.value.fileTree}\n</project_files>\n\n`;
		}

		// Add active sources
		activeSources.value.forEach(source => {
			content += `<source type="${source.type}" name="${source.name}">\n${source.content}\n</source>\n\n`;
		});

		return content.trim();
	});

	function setProject(project: Project) {
		currentProject.value = project;
	}

	function toggleSource(sourceId: string) {
		if (!currentProject.value) return;
		const source = currentProject.value.sources.find(s => s.id === sourceId);
		if (source) {
			source.enabled = !source.enabled;
		}
	}

	return {
		currentProject,
		activeSources,
		promptContent,
		setProject,
		toggleSource
	};
});
