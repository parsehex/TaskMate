import { Snippet } from '../../shared/types/index.js';
import { SnippetsMessageHandlers } from '../../shared/types/ws/index.js';
import * as helper from '../db/helper/snippets.js';

async function GET_SNIPPET(id: number) {
	return await helper.getSnippetById(id);
}

async function GET_SNIPPETS(project_id: number | undefined) {
	const where: any = {};
	if (Number.isInteger(project_id)) where['project_id'] = project_id;
	return await helper.getSnippets();
}

async function CREATE_SNIPPET(project_id: number, snippet: Partial<Snippet>) {
	return await helper.createSnippet(project_id, snippet);
}

async function UPDATE_SNIPPET(id: number, snippet: Partial<Snippet>) {
	return await helper.updateSnippet(id, snippet);
}
async function UPDATE_SNIPPETS(snippets: Partial<Snippet>[]) {
	return await Promise.all(
		snippets.map((snippet) => {
			if (!snippet.id) throw new Error('Snippet id is required');
			return UPDATE_SNIPPET(snippet.id, snippet);
		})
	);
}

async function DELETE_SNIPPET(id: number) {
	return await helper.deleteSnippet(id);
}

const handlers: SnippetsMessageHandlers = {
	GET_SNIPPET,
	GET_SNIPPETS,
	CREATE_SNIPPET,
	UPDATE_SNIPPET,
	UPDATE_SNIPPETS,
	DELETE_SNIPPET,
};

export default handlers;
