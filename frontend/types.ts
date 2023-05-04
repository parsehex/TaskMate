export interface Project {
	id: number;
	name: string;
	description: string;
	ignore_files: string;
	created_at: string;
}

export interface Prompt_Part {
	id: number;
	project_id: number;
	content: string;
	name: string;
	snippet: boolean;
	part_type: 'file' | 'snippet';
	token_count: number;
	included: boolean;
	position: number;
	created_at: string;
	updated_at: string;
}
