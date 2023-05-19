export interface Project {
	id: number;
	name: string;
	description: string;
	ignore_files: string;
	created_at: string;
}

export type Prompt_Part = Snippet | File;

export interface Snippet {
	id: number;
	project_id: number;
	name: string;
	content: string;
	summary: string;
	included: boolean;
	use_title: boolean;
	use_summary: boolean;
	type: 'snippet';
	position: number;
	created_at: string;
	updated_at: string;
}

export interface File {
	id: number;
	project_id: number;
	name: string;
	content?: string; // This field will be populated with the file's content when it is read from the API. It is not used when creating or updating a file.
	summary: string;
	included: boolean;
	use_title: boolean;
	use_summary: boolean;
	created_at: string;
	updated_at: string;
}

export function isSnippet(part: Prompt_Part): part is Snippet {
	return 'type' in part && 'content' in part;
}
export function isFile(part: Prompt_Part): part is Snippet {
	return !('type' in part);
}
