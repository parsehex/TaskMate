import { Snippet } from '../../shared/types';
import { SnippetsMessageHandlers } from '../../shared/types/ws';
import { call } from '.';

async function GET_SNIPPET(snippetId: number) {
	return (await call('GET_SNIPPET', [snippetId])) as Snippet;
}
async function GET_SNIPPETS(project_id: number | undefined) {
	return (await call('GET_SNIPPETS', [project_id])) as Snippet[];
}
async function CREATE_SNIPPET(project_id: number, snippet: Partial<Snippet>) {
	return (await call('CREATE_SNIPPET', [project_id, snippet])) as Snippet;
}
async function UPDATE_SNIPPET(id: number, snippet: Partial<Snippet>) {
	return (await call('UPDATE_SNIPPET', [id, snippet])) as Snippet;
}
async function UPDATE_SNIPPETS(snippets: Partial<Snippet>[]) {
	return (await call('UPDATE_SNIPPETS', [snippets])) as Snippet[];
}
async function DELETE_SNIPPET(id: number) {
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
