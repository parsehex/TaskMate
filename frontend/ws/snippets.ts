import { Snippet } from '../../shared/types';
import { SnippetsMessageHandlers } from '../../shared/types/ws';
import { call } from '.';

async function GET_SNIPPET(snippetId: string) {
	return (await call('GET_SNIPPET', [snippetId])) as Snippet;
}
async function GET_SNIPPETS(project_id: string | undefined) {
	return (await call('GET_SNIPPETS', [project_id])) as Snippet[];
}
async function CREATE_SNIPPET(project_id: string, snippet: Partial<Snippet>) {
	return (await call('CREATE_SNIPPET', [project_id, snippet])) as Snippet;
}
async function UPDATE_SNIPPET(id: string, snippet: Partial<Snippet>) {
	return (await call('UPDATE_SNIPPET', [id, snippet])) as Snippet;
}
async function UPDATE_SNIPPETS(snippets: Partial<Snippet>[]) {
	return (await call('UPDATE_SNIPPETS', [snippets])) as Snippet[];
}
async function DELETE_SNIPPET(id: string) {
	return (await call('DELETE_SNIPPET', [id])) as void;
}

const SnippetsHandlers: SnippetsMessageHandlers = {
	GET_SNIPPET,
	GET_SNIPPETS,
	CREATE_SNIPPET,
	UPDATE_SNIPPET,
	UPDATE_SNIPPETS,
	DELETE_SNIPPET,
};

export default SnippetsHandlers;
