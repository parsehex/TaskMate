import express from 'express';
import { check } from 'express-validator';
import { Snippet } from '../../shared/types/index.js';
import * as helper from '../db/helper/snippets.js';
import { validateRequest } from '../express.js';

const router = express.Router();

router.get('/api/snippets', async (req, res) => {
	try {
		const snippets = await helper.getSnippets();
		res.status(200).json(snippets);
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

router.get(
	'/api/snippets/:project_id',
	check('project_id').isNumeric(),
	validateRequest,
	async (req, res) => {
		try {
			const snippets = await helper.getSnippetsByProjectId(
				+req.body.project_id
			);
			res.status(200).json(snippets);
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	}
);

router.post(
	'/api/snippets',
	check('project_id').isNumeric(),
	check('name').isString(),
	check(['content', 'summary']).optional().isString(),
	check(['included', 'use_title', 'use_summary']).optional().isBoolean(),
	check('position').optional().isNumeric(),
	validateRequest,
	async (req, res) => {
		try {
			const newSnippet = await helper.createSnippet(
				+req.body.project_id,
				req.body
			);
			res
				.status(201)
				.json({ message: 'Snippet created successfully', data: newSnippet });
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	}
);

router.put(
	'/api/snippets/:id',
	check('id').isNumeric(),
	check(['name', 'content', 'summary']).isString().optional(),
	check(['included', 'use_title', 'use_summary']).isBoolean().optional(),
	check('position').isNumeric().optional(),
	validateRequest,
	async (req, res) => {
		try {
			const updatedSnippet = await helper.updateSnippet(+req.body.id, req.body);
			res.status(200).json({
				message: 'Snippet updated successfully',
				data: updatedSnippet,
			});
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	}
);

router.delete(
	'/api/snippets/:id',
	check('id').isNumeric(),
	validateRequest,
	async (req, res) => {
		try {
			await helper.deleteSnippet(+req.body.id);
			res.status(200).json({ message: 'Snippet deleted successfully' });
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	}
);

export default router;
