import { Snippet } from '../../shared/types';
import SnippetsHandlers from '../ws/snippets';
import { convertBooleans } from './utils';

const SnippetBooleanColumns = ['included', 'use_title', 'use_summary'];

export const fetchSnippets = async (projectId?: string): Promise<Snippet[]> => {
	const snippets = await SnippetsHandlers.GET_SNIPPETS(projectId);
	return snippets.map((snippet: any) =>
		convertBooleans(snippet, SnippetBooleanColumns)
	);
};

export const updateSnippet = async (
	data: Partial<Snippet>
	id: string,
): Promise<Snippet> => {
	const res = await SnippetsHandlers.UPDATE_SNIPPET(id, data);
	return convertBooleans(res, SnippetBooleanColumns);
};
export const updateSnippets = async (
	data: Partial<Snippet>[]
): Promise<Snippet[]> => {
	const res = await SnippetsHandlers.UPDATE_SNIPPETS(data);
	return res.map((snippet: any) =>
		convertBooleans(snippet, SnippetBooleanColumns)
	);
};

export const createSnippet = async (
	projectId: string,
	newSnippet: Partial<Snippet>
): Promise<Snippet> => {
	const res = await SnippetsHandlers.CREATE_SNIPPET(projectId, newSnippet);
	return convertBooleans(res, SnippetBooleanColumns);
};

export const deleteSnippet = async (id: string): Promise<void> => {
	await SnippetsHandlers.DELETE_SNIPPET(id);
};
