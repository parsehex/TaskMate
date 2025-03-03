import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { Snippet } from '../shared/types/index.js';
import { GET_TOKEN_COUNT } from './api/utils.js';

export async function loadFileSnippets(projectId: string, projectPath: string) {
	const snippetsPath = path.join(projectPath, '.snippets');
	if (!(await fs.pathExists(snippetsPath))) return [];

	const files = await fs.readdir(snippetsPath);
	const snippets: Snippet[] = [];

	for (const file of files) {
		if (!file.endsWith('.md')) continue;
		const filePath = path.join(snippetsPath, file);
		let content = await fs.readFile(filePath, 'utf-8');

		const { data, content: body } = matter(content);
		let isIncluded = false;
		if (data.included === true) isIncluded = true;
		let useTitle = false;
		if (data.use_title === true || data.useTitle === true) useTitle = true;
		const name = data.name || path.basename(file, '.md');
		content = body.trim();
		const s: Snippet = {
			updated_at: '',
			created_at: '',
			id: `file-backed:${file}`,
			project_id: projectId,
			name,
			content,
			summary: '',
			included: isIncluded,
			use_title: useTitle,
			use_summary: false,
			type: 'snippet',
			position: -1,

			// +7 characters for wrapping content with backticks
			token_count: await GET_TOKEN_COUNT({ text: name + content + 7 }),
		};
		snippets.push(s);
	}

	return snippets;
}
