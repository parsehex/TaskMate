import { Project, Prompt_Part } from '../types';

const PromptPartBooleanColumns = ['included', 'use_title', 'use_summary'];

// helper function to convert sqlite's 0/1 to boolean based on column names
const convertBooleans = (obj: any, columns: string[]): any => {
	for (const column of columns) {
		if (obj[column] === undefined) continue;
		if (obj[column] === 0) obj[column] = false;
		else if (obj[column] === 1) obj[column] = true;
	}
	return obj;
};

export const fetchProjects = async (): Promise<Project[]> => {
	const response = await fetch('/api/projects');
	return await response.json();
};

export const fetchPromptParts = async (
	selectedProjectId?: number | null
): Promise<Prompt_Part[]> => {
	if (!selectedProjectId) {
		const response = await fetch('/api/prompt_parts');
		const parts = await response.json();
		return parts.map((part: any) =>
			convertBooleans(part, PromptPartBooleanColumns)
		);
	}
	const response = await fetch(`/api/prompt_parts/${selectedProjectId}`);
	const parts = await response.json();
	return parts.map((part: any) =>
		convertBooleans(part, PromptPartBooleanColumns)
	);
};

export const updateProject = async (
	id: number,
	data: Partial<Project>
): Promise<void> => {
	const response = await fetch(`/api/projects/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const { error } = await response.json();
		throw new Error(error);
	}
};

interface PromptPartUpdateResponse {
	message: string;
	promptPart: Prompt_Part;
}
export const updatePromptPart = async (
	id: number,
	data: Partial<Prompt_Part>
): Promise<PromptPartUpdateResponse> => {
	if (!id) throw new Error('Prompt part id is required');
	if (data.included !== undefined)
		(data as any).included = data.included ? 1 : 0;
	if (data.use_summary !== undefined)
		(data as any).use_summary = data.use_summary ? 1 : 0;
	const response = await fetch(`/api/prompt_parts/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	const res = await response.json();
	res.promptPart = convertBooleans(res.promptPart, PromptPartBooleanColumns);
	return res;
};

export const updatePromptParts = async (
	ids: number[],
	promptParts: Partial<Prompt_Part>[] = []
): Promise<Prompt_Part[]> => {
	const updatedPromptParts = await Promise.all(
		ids.map(async (id, i) => {
			const res = await updatePromptPart(id, promptParts[i]);
			res.promptPart = convertBooleans(
				res.promptPart,
				PromptPartBooleanColumns
			);
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
	selectedProjectId: number | null,
	newPromptPart: Partial<Prompt_Part>
): Promise<PromptPartCreateResponse | void> => {
	if (!selectedProjectId) return;
	const name = 'New Snippet' || newPromptPart.name;
	const response = await fetch(`/api/prompt_parts`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			...newPromptPart,
			name,
			project_id: selectedProjectId,
		}),
	});
	if (response.ok) {
		const res = await response.json();
		res.promptPart = convertBooleans(res.promptPart, PromptPartBooleanColumns);
		return res;
	}
};

export const deletePromptPart = async (id: number): Promise<void> => {
	const response = await fetch(`/api/prompt_parts/${id}`, {
		method: 'DELETE',
	});
	if (!response.ok) {
		const { error } = await response.json();
		throw new Error(error);
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

interface GenerateSummaryResponse {
	summary: string;
}
export const generateSummary = async (
	partId: number
): Promise<GenerateSummaryResponse> => {
	const response = await fetch(`/api/prompt_parts/${partId}/generate_summary`);
	const res = await response.json();
	return res;
};
