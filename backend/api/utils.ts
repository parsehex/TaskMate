import fs from 'fs-extra';
import path from 'path';
import { minimatch } from 'minimatch';
import { Prompt_Part } from '../../shared/types/index.js';
import {
	GenerateSummaryMessage,
	GetTokenCountMessage,
	UtilsMessageHandlers,
} from '../../shared/types/ws/index.js';
import { getFileById } from '../db/helper/files.js';
import { getSnippetById } from '../db/helper/snippets.js';
import { readFileContents } from '../fs-utils.js';
import { summarize } from '../openai/index.js';
import { getProjectPathLookup } from '../path-utils.js';
import { getTokenCount } from '../tokenizer.js';
import { DefaultIgnoreFiles } from '../../shared/const.js';

export async function GET_TOKEN_COUNT(payload: GetTokenCountMessage) {
	// data.payload is an object containing either a text prop or a promptPartId prop
	let content = '';
	if (payload.snippetId !== undefined) {
		const snippet = await getSnippetById(payload.snippetId);
		if (snippet) {
			content += snippet.use_title
				? snippet.name + (snippet.use_summary ? ' (summary)' : '') + ':\n'
				: '';
			if (payload.text) {
				// allow setting snippet content by passing snippetId && text props
				content += payload.text;
			} else {
				content += snippet.use_summary ? snippet.summary : snippet.content;
			}
		}
	} else if (payload.fileId !== undefined) {
		const file = await getFileById(payload.fileId);
		if (file.use_summary) {
			content = file.summary;
		} else {
			const p = await getProjectPathLookup(file.project_id, file.name);
			content = await readFileContents(p);
		}
	} else if (payload.text !== undefined) {
		content = payload.text;
	}

	return getTokenCount(content);
}

async function GENERATE_SUMMARY(payload: GenerateSummaryMessage) {
	let part: Prompt_Part | undefined;
	let content = '';
	if (payload.snippetId) {
		part = await getSnippetById(payload.snippetId);
		content = part.use_summary ? part.summary : (part.content as string);
	} else if (payload.fileId) {
		part = await getFileById(payload.fileId);
		content = part.use_summary
			? part.summary
			: await readFileContents(
					await getProjectPathLookup(part.project_id, part.name)
			  );
	} else {
		throw new Error('No snippetId or fileId provided');
	}
	const summary = await summarize(part.name, content, part.use_summary);
	if (!summary) {
		return 'No summary generated';
	}
	return summary.choices[0].message.content as string;
}

async function FILTER_IGNORE_PATHS(projectPath: string): Promise<string[]> {
	if (!projectPath || !(await fs.pathExists(projectPath))) {
		return [];
	}

	const allItems: string[] = [];

	try {
		// Recursively get all items in the project path
		const collectItems = async (dir: string, relativePath = '') => {
			const items = await fs.readdir(dir, { withFileTypes: true });
			for (const item of items) {
				const itemRelativePath = relativePath ? `${relativePath}/${item.name}` : item.name;
				allItems.push(itemRelativePath);
				if (item.isDirectory()) {
					await collectItems(path.join(dir, item.name), itemRelativePath);
				}
			}
		};

		await collectItems(projectPath);
	} catch (error) {
		console.error('Error scanning project path:', error);
		return [];
	}

	// Filter DefaultIgnoreFiles to only include patterns that match at least one item
	const matchingPatterns = DefaultIgnoreFiles.filter((pattern) => {
		// Handle patterns like **/.git, **/node_modules, etc.
		return allItems.some((item) => {
			try {
				return minimatch(item, pattern, { dot: true }) || minimatch(`${item}/`, pattern, { dot: true });
			} catch {
				return false;
			}
		});
	});

	return matchingPatterns;
}

const handlers: UtilsMessageHandlers = {
	GET_TOKEN_COUNT,
	GENERATE_SUMMARY,
	FILTER_IGNORE_PATHS,
};

export default handlers;
