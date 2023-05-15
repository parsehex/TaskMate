import express from 'express';
import { check } from 'express-validator';
import * as snippetHelper from '../db/helper/snippets.js';
import * as fileHelper from '../db/helper/files.js';
import { validateRequest } from '../express.js';
import { getTokenCount } from '../tokenizer.js';
import { getProjectPathLookup } from '../path-utils.js';
import { readFileContents } from '../fs-utils.js';

const router = express.Router();

router.post('/api/count_tokens', async (req, res) => {
	const { text } = req.body;
	if (!text) {
		res.status(200).json({ token_count: 0 });
		return;
	}
	const token_count = getTokenCount(text);
	res.status(200).json({ token_count });
});
router.get(
	'/api/snippets/:id/token_count',
	check('id').isNumeric(),
	validateRequest,
	async (req, res) => {
		try {
			const snippet = await snippetHelper.getSnippetById(+req.body.id);
			if (!snippet) {
				return res.status(404).json({ error: 'Snippet not found' });
			}
			const content = snippet.use_summary ? snippet.summary : snippet.content;
			const token_count = getTokenCount(content);
			res.status(200).json({ token_count });
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	}
);
router.get(
	'/api/files/:id/token_count',
	check('id').isNumeric(),
	validateRequest,
	async (req, res) => {
		try {
			const file = await fileHelper.getFileById(+req.body.id);
			if (!file) {
				return res.status(404).json({ error: 'File not found' });
			}
			const p = await getProjectPathLookup(file.project_id, file.name);
			const content = file.use_summary
				? file.summary
				: await readFileContents(p);
			const token_count = getTokenCount(content);
			res.status(200).json({ token_count });
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	}
);

export default router;
