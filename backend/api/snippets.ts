import { Snippet } from '../../shared/types/index.js';
import { SnippetsMessageHandlers } from '../../shared/types/ws/index.js';
import * as helper from '../db/helper/snippets.js';
import path from 'path';
import fs from 'fs-extra';
import { getProjectPath } from '../path-utils.js';
import { GET_TOKEN_COUNT } from './utils.js';

/** Update DB Snippets' token counts to reflect their current content */
export async function syncSnippetTokenCounts() {
	const snippets = await GET_SNIPPETS(undefined);
	for (const s of snippets) {
		if (s.id.startsWith('file-backed:')) continue;

		const token_count = await GET_TOKEN_COUNT({ snippetId: s.id });
		const data = { token_count };
		if (s.token_count !== token_count) await UPDATE_SNIPPET(s.id, data, true);
	}
}

async function GET_SNIPPET(id: string) {
	return await helper.getSnippetById(id);
}

async function GET_SNIPPETS(project_id: string | undefined) {
	if (!project_id) return await helper.getSnippets('*');

	return await helper.getSnippetsByProjectId(project_id);
}

async function CREATE_SNIPPET(project_id: string, snippet: Partial<Snippet>) {
	return await helper.createSnippet(project_id, snippet);
}

async function UPDATE_SNIPPET(
	id: string,
	snippet: Partial<Snippet>,
	skipTokenCount = false
) {
	if (id.startsWith('file-backed:')) {
		const project_id = snippet.project_id;
		const filePath = path.join(
			await getProjectPath({ id: project_id }, '.snippets'),
			id.replace('file-backed:', '')
		);

		if (await fs.pathExists(filePath)) {
			const included = !!snippet.included;
			const use_title = !!snippet.use_title;
			const frontmatter = `---\nincluded: ${included}\nuse_title: ${use_title}\n---\n`;
			await fs.writeFile(filePath, frontmatter + snippet.content);
			return { ...snippet, id }; // Return updated snippet
		}
		console.error('File-backed snippet not found');
		return {} as any;
	}

	if (!skipTokenCount) {
		const tokens = await GET_TOKEN_COUNT({
			snippetId: snippet.id,
			text: snippet.content, // use updated instead of saved content
		});
		snippet.token_count = tokens;
	}

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
