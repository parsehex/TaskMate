import { create } from 'zustand';
import { Project, Prompt_Part } from '../types';

interface State {
	projects: Project[];
	selectedProjectId: number | null;
	promptParts: Prompt_Part[];
	selectedPromptPart: Prompt_Part | null;
	includedPromptParts: Prompt_Part[];
	promptTokenCount: number;
	readOnly: boolean;

	setProjects: (projects: Project[]) => void;
	setSelectedProjectId: (projectId: number | null) => void;
	setPromptParts: (promptParts: Prompt_Part[]) => void;
	setPromptPart: (promptPart: Prompt_Part) => void;
	setSelectedPromptPart: (promptPart: Prompt_Part | null) => void;
	setIncludedPromptParts: (promptParts: Prompt_Part[]) => void;
	setPromptTokenCount: (tokenCount: number) => void;
	setReadOnly: (readOnly: boolean) => void;
}

export const useStore = create<State>((set) => ({
	projects: [],
	selectedProjectId: null,
	promptParts: [],
	includedPromptParts: [],
	selectedPromptPart: null,
	promptTokenCount: 0,
	readOnly: false,

	setProjects: (projects) => set({ projects }),
	setSelectedProjectId: (projectId) => set({ selectedProjectId: projectId }),
	setPromptParts: (promptParts) => set({ promptParts }),
	setPromptPart: (promptPart) => {
		const promptParts = [...useStore.getState().promptParts];
		const index = promptParts.findIndex((part) => part.id === promptPart.id);
		promptParts[index] = promptPart;
		set({ promptParts });
	},
	setSelectedPromptPart: (promptPart) =>
		set({ selectedPromptPart: promptPart }),
	setIncludedPromptParts: (promptParts) =>
		set({ includedPromptParts: promptParts }),
	setPromptTokenCount: (tokenCount) => set({ promptTokenCount: tokenCount }),
	setReadOnly: (readOnly) => set({ readOnly }),
}));
