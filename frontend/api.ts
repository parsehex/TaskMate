import { Project, Prompt_Part } from './types';

export const fetchProjects = async (): Promise<Project[]> => {
	const response = await fetch('/api/projects');
	return await response.json();
};

export const fetchPromptParts = async (
	selectedProjectId?: number | null
): Promise<Prompt_Part[]> => {
	if (!selectedProjectId) {
		const response = await fetch('/api/prompt_parts');
		return await response.json();
	}
	const response = await fetch(`/api/prompt_parts/${selectedProjectId}`);
	return await response.json();
};

interface PromptPartUpdate {
	name?: string;
	included?: boolean;
	position?: number;
	content?: string;
}
interface PromptPartUpdateResponse {
	message: string;
	promptPart: Prompt_Part;
}
export const updatePromptPart = async (
	id: number,
	data: PromptPartUpdate
): Promise<PromptPartUpdateResponse> => {
	const response = await fetch(`/api/prompt_parts/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	return response.json();
};

export const updatePromptParts = async (
	ids: number[],
	promptParts: PromptPartUpdate[]
): Promise<Prompt_Part[]> => {
	const updatedPromptParts = await Promise.all(
		ids.map(async (id, i) => {
			const res = await updatePromptPart(id, promptParts[i]);
			return res.promptPart;
		})
	);
	return updatedPromptParts;
};

interface PromptPartCreateResponse {
	message: string;
	promptPart: Prompt_Part;
}
export const createPromptPart = async (
	selectedProjectId: number | null
): Promise<PromptPartCreateResponse | void> => {
	if (!selectedProjectId) return;
	const name = 'New Snippet';
	const response = await fetch(`/api/prompt_parts`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			name,
			content: '',
			project_id: selectedProjectId,
			part_type: 'snippet',
		}),
	});
	if (response.ok) {
		return await response.json();
	}
};

interface GetTokenCountOptions {
	text?: string;
	promptPartId?: number;
}
interface GetTokenCountResponse {
	token_count: number;
}
export const getTokenCount = async (
	options: GetTokenCountOptions
): Promise<GetTokenCountResponse> => {
	const { text, promptPartId } = options;
	if (text) {
		const response = await fetch('/api/count_tokens', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ text }),
		});
		return await response.json();
	} else if (promptPartId) {
		const response = await fetch(
			`/api/prompt_parts/${promptPartId}/token_count`
		);
		return await response.json();
	} else {
		return { token_count: 0 };
	}
};
