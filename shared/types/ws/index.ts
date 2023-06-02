import { File, Project, Snippet } from '../index.js';

export interface FilesMessageHandlers {
	GET_FILE: (fileId: number) => Promise<File>;
	GET_FILES: (project_id: number | undefined) => Promise<File[]>;
	CREATE_FILE: (project_id: number, name: string) => Promise<File>;
	UPDATE_FILE: (id: number, file: Partial<File>) => Promise<File>;
	UPDATE_FILES: (files: Partial<File>[]) => Promise<File[]>;
	DELETE_FILE: (id: number) => Promise<void>;
}

export interface ProjectsMessageHandlers {
	GET_PROJECTS: () => Promise<Project[]>;
	CREATE_PROJECT: (name: string) => Promise<Project>;
	UPDATE_PROJECT: (id: number, project: Partial<Project>) => Promise<Project>;
	DELETE_PROJECT: (id: number) => Promise<void>;
}

export interface SnippetsMessageHandlers {
	GET_SNIPPET: (id: number) => Promise<Snippet>;
	GET_SNIPPETS: (project_id: number | undefined) => Promise<Snippet[]>;
	CREATE_SNIPPET: (
		project_id: number,
		snippet: Partial<Snippet>
	) => Promise<Snippet>;
	UPDATE_SNIPPET: (id: number, snippet: Partial<Snippet>) => Promise<Snippet>;
	UPDATE_SNIPPETS: (snippets: Partial<Snippet>[]) => Promise<Snippet[]>;
	DELETE_SNIPPET: (id: number) => Promise<void>;
}

export interface GetTokenCountMessage {
	text?: string;
	fileId?: number;
	snippetId?: number;
}
export interface GenerateSummaryMessage {
	fileId?: number;
	snippetId?: number;
}

export interface UtilsMessageHandlers {
	GET_TOKEN_COUNT: (payload: GetTokenCountMessage) => Promise<number>;
	GENERATE_SUMMARY: (payload: GenerateSummaryMessage) => Promise<string>;
}

export type MessageHandlers = FilesMessageHandlers &
	ProjectsMessageHandlers &
	SnippetsMessageHandlers &
	UtilsMessageHandlers;
