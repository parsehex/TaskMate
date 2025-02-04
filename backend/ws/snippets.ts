import { Snippet } from '../../shared/types/index.js';
import { SnippetsMessageHandlers } from '../../shared/types/ws/index.js';
import * as helper from '../db/helper/snippets.js';

async function GET_SNIPPET(id: string) {
	return await helper.getSnippetById(id);
}

async function GET_SNIPPETS(project_id: string | undefined) {
	const where: any = {};
	if (project_id !== null && Number.isInteger(project_id))
		where['project_id'] = project_id;
	return await helper.getSnippets('*', where);
}

async function CREATE_SNIPPET(project_id: string, snippet: Partial<Snippet>) {
	return await helper.createSnippet(project_id, snippet);
}

async function UPDATE_SNIPPET(id: string, snippet: Partial<Snippet>) {
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

async function DELETE_SNIPPET(id: string) {
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
