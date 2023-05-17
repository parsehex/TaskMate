import { Prompt_Part } from '../../shared/types/index.js';
import {
	GenerateSummaryMessage,
	GetTokenCountMessage,
	UtilsMessageHandlers,
} from '../../shared/types/ws/index.js';
import { getFileById } from '../db/helper/files.js';
import { getSnippetById } from '../db/helper/snippets.js';
import { readFileContents } from '../fs-utils.js';
import { summarize } from '../openai.js';
import { getProjectPathLookup } from '../path-utils.js';
import { getTokenCount } from '../tokenizer.js';

async function GET_TOKEN_COUNT(payload: GetTokenCountMessage) {
	// data.payload is an object containing either a text prop or a promptPartId prop
	let content = '';
	let token_count = 0;
	if (payload.text) {
		content = payload.text;
	} else if (payload.snippetId) {
		const snippet = await getSnippetById(payload.snippetId);
		content = snippet.use_summary ? snippet.summary : snippet.content;
	} else if (payload.fileId) {
		const file = await getFileById(payload.fileId);
		if (file.use_summary) {
			content = file.summary;
		} else {
			const p = await getProjectPathLookup(file.project_id, file.name);
			content = await readFileContents(p);
		}
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
	return summary.text;
}

const handlers: UtilsMessageHandlers = {
	GET_TOKEN_COUNT,
	GENERATE_SUMMARY,
};

export default handlers;
