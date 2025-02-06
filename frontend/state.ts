import { create } from 'zustand';
import { Project, Prompt_Part, Snippet, File } from '../shared/types';

interface State {
	projects: Project[];
	selectedProjectId: string | null;
	files: File[];
	snippets: Snippet[];
	selectedPromptPart: Prompt_Part | null;
	includedPromptParts: Prompt_Part[];
	promptTokenCount: number;
	readOnly: boolean;
	isConnected: boolean;
	chatVisible: boolean;
	chatMessages: any[];

	setChatVisible: (visible: boolean) => void;
	addChatMessage: (message: any) => void;
	setProjects: (projects: Project[]) => void;
	setSelectedProjectId: (projectId: string | null) => void;
	setFiles: (files: File[]) => void;
	setFile: (file: File) => void;
	setSnippets: (snippets: Snippet[]) => void;
	setSnippet: (snippet: Snippet) => void;
	setSelectedPromptPart: (promptPart: Prompt_Part | null) => void;
	setIncludedPromptParts: (promptParts: Prompt_Part[]) => void;
	setPromptTokenCount: (tokenCount: number) => void;
	setReadOnly: (readOnly: boolean) => void;
	setIsConnected: (isConnected: boolean) => void;
}

export const useStore = create<State>((set) => ({
	projects: [],
	selectedProjectId: null,
	files: [],
	snippets: [],
	includedPromptParts: [],
	selectedPromptPart: null,
	promptTokenCount: 0,
	readOnly: false,
	isConnected: false,
	chatVisible: false,
	chatMessages: [],
  setChatVisible: (visible: boolean) => set({ chatVisible: visible }),
  addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] })),

	setProjects: (projects) => set({ projects }),
	setSelectedProjectId: (projectId) => set({ selectedProjectId: projectId }),
	setFiles: (files) => set({ files }),
	setFile: (file) => {
		const files = [...useStore.getState().files];
		const index = files.findIndex((f) => f.id === file.id);
		files[index] = file;
		set({ files });
	},
	setSnippets: (snippets) => set({ snippets }),
	setSnippet: (snippet) => {
		const snippets = [...useStore.getState().snippets];
		const index = snippets.findIndex((s) => s.id === snippet.id);
		snippets[index] = snippet;
		set({ snippets });
	},
	setSelectedPromptPart: (part) => set({ selectedPromptPart: part, chatVisible: part ? false : true }),
	setIncludedPromptParts: (promptParts) =>
		set({ includedPromptParts: promptParts }),
	setPromptTokenCount: (tokenCount) => set({ promptTokenCount: tokenCount }),
	setReadOnly: (readOnly) => set({ readOnly }),
	setIsConnected: (isConnected) => set({ isConnected }),
}));
