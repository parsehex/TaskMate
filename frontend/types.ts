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
	name: string;
	content: string;
	summary: string;
	included: boolean;
	use_summary: boolean;
	part_type: 'file' | 'snippet';
	position: number;
	created_at: string;
	updated_at: string;
}
