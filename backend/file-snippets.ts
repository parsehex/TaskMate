import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { Snippet } from '../shared/types/index.js';

export async function loadFileSnippets(projectId: string, projectPath: string) {
	const snippetsPath = path.join(projectPath, '.snippets');
	if (!(await fs.pathExists(snippetsPath))) return [];

	const files = await fs.readdir(snippetsPath);
	const snippets: Snippet[] = [];

	for (const file of files) {
		if (!file.endsWith('.md')) continue;
		const filePath = path.join(snippetsPath, file);
		const content = await fs.readFile(filePath, 'utf-8');

		const { data, content: body } = matter(content);
		let isIncluded = false;
		if (data.included === true) isIncluded = true;
		let useTitle = false;
		if (data.use_title === true || data.useTitle === true) useTitle = true;
		const s: Snippet = {
			updated_at: '',
			created_at: '',
			id: `file-backed:${file}`,
			project_id: projectId,
			name: data.name || path.basename(file, '.md'),
			content: body.trim(),
			summary: '',
			included: isIncluded,
			use_title: useTitle,
			use_summary: false,
			type: 'snippet',
			position: -1,
		};
		snippets.push(s);
	}

	return snippets;
}
