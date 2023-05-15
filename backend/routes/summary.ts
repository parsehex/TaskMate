import express from 'express';
import { check } from 'express-validator';
import * as snippetHelper from '../db/helper/snippets.js';
import * as fileHelper from '../db/helper/files.js';
import { validateRequest } from '../express.js';
import { getTokenCount } from '../tokenizer.js';
import { getProjectPathLookup } from '../path-utils.js';
import { readFileContents } from '../fs-utils.js';
import { summarize } from '../openai.js';

const router = express.Router();

router.get(
	'/api/snippets/:id/generate_summary',
	check('id').isNumeric(),
	validateRequest,
	async (req, res) => {
		try {
			const snippet = await snippetHelper.getSnippetById(+req.body.id);
			if (!snippet) {
				return res.status(404).json({ error: 'Snippet not found' });
			}
			const data = await summarize(snippet);
			res.status(200).json({ data });
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	}
);
router.get(
	'/api/files/:id/generate_summary',
	check('id').isNumeric(),
	validateRequest,
	async (req, res) => {
		try {
			const file = await fileHelper.getFileById(+req.body.id);
			if (!file) {
				return res.status(404).json({ error: 'File not found' });
			}
			const p = await getProjectPathLookup(file.project_id, file.name);
			const content = await readFileContents(p);
			const data = await summarize({ ...file, content });
			res.status(200).json({ data });
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	}
);

export default router;
