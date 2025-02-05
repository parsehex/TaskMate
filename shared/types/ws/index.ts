import { File, Project, Snippet } from '../index.js';

export interface FilesMessageHandlers {
	GET_FILE: (fileId: string) => Promise<File>;
	GET_FILES: (project_id: string | undefined) => Promise<File[]>;
	CREATE_FILE: (project_id: string, name: string) => Promise<File>;
	UPDATE_FILE: (id: string, file: Partial<File>) => Promise<File>;
	UPDATE_FILES: (files: Partial<File>[]) => Promise<File[]>;
	DELETE_FILE: (id: string) => Promise<void>;
}

export interface ProjectsMessageHandlers {
	GET_PROJECTS: () => Promise<Project[]>;
	CREATE_PROJECT: (name: string, path: string) => Promise<Project>;
	UPDATE_PROJECT: (id: string, project: Partial<Project>) => Promise<Project>;
	DELETE_PROJECT: (id: string) => Promise<void>;
}

export interface SnippetsMessageHandlers {
	GET_SNIPPET: (id: string) => Promise<Snippet>;
	GET_SNIPPETS: (project_id: string | undefined) => Promise<Snippet[]>;
	CREATE_SNIPPET: (
		project_id: string,
		snippet: Partial<Snippet>
	) => Promise<Snippet>;
	UPDATE_SNIPPET: (id: string, snippet: Partial<Snippet>) => Promise<Snippet>;
	UPDATE_SNIPPETS: (snippets: Partial<Snippet>[]) => Promise<Snippet[]>;
	DELETE_SNIPPET: (id: string) => Promise<void>;
}

export interface GetTokenCountMessage {
	text?: string;
	fileId?: string;
	snippetId?: string;
}
export interface GenerateSummaryMessage {
	fileId?: string;
	snippetId?: string;
}

export interface UtilsMessageHandlers {
	GET_TOKEN_COUNT: (payload: GetTokenCountMessage) => Promise<number>;
	GENERATE_SUMMARY: (payload: GenerateSummaryMessage) => Promise<string>;
}

export type MessageHandlers = FilesMessageHandlers &
	ProjectsMessageHandlers &
	SnippetsMessageHandlers &
	UtilsMessageHandlers;

export type WSEvent = 'file.added' | 'file.removed';

export interface WSMessage<T = any> {
	id: string;
	event?: WSEvent;
	endpoint: keyof MessageHandlers;
	args?: any[];
	replyTo?: string;
}

export interface WSResponse<T = any> {
	requestId?: string;
	data: T;
	error?: Error;
}
