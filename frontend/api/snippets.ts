import { Snippet } from '../../types';
import { convertBooleans } from './utils';

const SnippetBooleanColumns = ['included', 'use_title', 'use_summary'];

export const fetchSnippets = async (projectId?: number): Promise<Snippet[]> => {
	const response = await fetch(
		`/api/snippets/${projectId ? `${projectId}` : ''}`
	);
	const snippets = await response.json();
	return snippets.map((snippet: any) =>
		convertBooleans(snippet, SnippetBooleanColumns)
	);
};

export const updateSnippet = async (
	id: number,
	data: Partial<Snippet>
): Promise<Snippet> => {
	const response = await fetch(`/api/snippets/${id}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	if (!response.ok) {
		const { error } = await response.json();
		throw new Error(error);
	}
	const res = await response.json();
	return convertBooleans(res.data, SnippetBooleanColumns);
};
export const updateSnippets = async (
	data: Partial<Snippet>[]
): Promise<Snippet[]> => {
	const newSnippets: Snippet[] = [];
	for (const snippet of data) {
		newSnippets.push(await updateSnippet(snippet.id!, snippet));
	}
	return newSnippets;
};

export const createSnippet = async (
	projectId: number,
	newSnippet: Partial<Snippet>
): Promise<Snippet> => {
	const response = await fetch(`/api/snippets`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			...newSnippet,
			project_id: projectId,
		}),
	});
	if (!response.ok) {
		const { error } = await response.json();
		throw new Error(error);
	}
	const res = await response.json();
	return convertBooleans(res.data, SnippetBooleanColumns);
};

export const deleteSnippet = async (id: number): Promise<void> => {
	const response = await fetch(`/api/snippets/${id}`, {
		method: 'DELETE',
	});
	if (!response.ok) {
		const { error } = await response.json();
		throw new Error(error);
	}
};
