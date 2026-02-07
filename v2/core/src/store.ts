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
