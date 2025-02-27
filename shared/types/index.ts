export interface Project {
	id: string;
	name: string;
	description: string;
	ignore_files: string;
	created_at: string;
}

export type Prompt_Part = Snippet | File;

export interface Snippet {
	id: string;
	project_id: string;
	name: string;
	content: string;
	summary: string;
	included: boolean;
	use_title: boolean;
	use_summary: boolean;
	type: 'snippet';
	position: number;
	created_at: string | number;
	updated_at: string | number;
}

export interface File {
	id: string;
	project_id: string;
	name: string;
	content?: string; // This field will be populated with the file's content when it is read from the API. It is not used when creating or updating a file.
	summary: string;
	included: boolean;
	use_title: boolean;
	use_summary: boolean;
	created_at: string;
	updated_at: string;
}

export type TabName = 'editor' | 'chat' | 'guide' | 'settings';

export function isSnippet(part: Prompt_Part): part is Snippet {
	return 'type' in part && 'content' in part;
}
export function isFile(part: Prompt_Part): part is Snippet {
	return !('type' in part);
}
