import express from 'express';
import { check } from 'express-validator';
import path from 'path';
import { Prompt_Part } from '../../types/index.js';
import * as helper from '../db/helper/prompt_parts.js';
import {
	deleteFile,
	fileExists,
	readFileContents,
	renameFile,
	writeFileContents,
} from '../fs-utils.js';
import { getTokenCount } from '../tokenizer.js';
import { getProjectPathLookup } from '../path-utils.js';
import { summarize } from '../openai.js';
import { validateRequest } from '../express.js';

const router = express.Router();

// Get all prompt parts
router.get('/api/prompt_parts', async (req, res) => {
	try {
		const promptParts = await helper.getPromptParts();
		res.status(200).json(promptParts);
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

// Get prompt parts by project id
router.get(
	'/api/prompt_parts/:project_id',
	check('project_id').isNumeric(),
	validateRequest,
	async (req, res) => {
		const data = req.body;
		try {
			const promptParts = await helper.getPromptPartsByProjectId(
				data.project_id
			);
			res.status(200).json(promptParts);
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	}
);

// Get prompt part token count by id
router.get(
	'/api/prompt_parts/:id/token_count',
	check('id').isNumeric(),
	validateRequest,
	async (req, res) => {
		const data = req.body;
		try {
			const promptPart = await helper.getPromptPartById(data.id);
			if (!promptPart) {
				return res.status(404).json({ error: 'Prompt part not found' });
			}
			if (promptPart.use_summary) {
				return res
					.status(200)
					.json({ token_count: getTokenCount(promptPart.summary) });
			}
			res.status(200).json({ token_count: getTokenCount(promptPart.content) });
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	}
);

router.get(
	'/api/prompt_parts/:id/generate_summary',
	check('id').isNumeric(),
	validateRequest,
	async (req, res) => {
		const data = req.body;
		try {
			const promptPart = await helper.getPromptPartById(data.id);
			if (!promptPart) {
				return res.status(404).json({ error: 'Prompt part not found' });
			}
			const summary = await summarize(promptPart);
			console.log(summary);
			res.status(200).json({ summary: summary.text });
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	}
);

// Create new prompt part
router.post(
	'/api/prompt_parts',
	check(['name']).isString(),
	check('project_id').isNumeric(),
	// part_type = 'snippet' | 'file', default = 'snippet'
	check('part_type').optional().isIn(['snippet', 'file']),
	check(['content', 'summary']).optional().isString(),
	check(['use_summary', 'use_title']).optional().isBoolean(),
	check('position').optional().isNumeric(),
	validateRequest,
	async (req, res) => {
		const data = req.body;
		if (!data.part_type) data.part_type = 'snippet';

		try {
			const existingPromptParts = await helper.getPromptPartsByProjectId(
				data.project_id
			);
			let position = existingPromptParts.length + 1;
			if (data.position) position = data.position;

			let fileContents: string | undefined;
			if (data.part_type === 'file') {
				// if adding a file, it must exist
				const p = await getProjectPathLookup(data.project_id, data.name);
				if (!(await fileExists(p))) {
					return res.status(404).json({ error: 'File not found' });
				} else {
					fileContents = await readFileContents(p);
				}
			}

			const fieldsObj: Partial<Prompt_Part> = {
				name: data.name,
				project_id: data.project_id,
				part_type: data.part_type,
				position,
				created_at: new Date() as any,
				updated_at: new Date() as any,
			};

			const promptPart = await helper.createPromptPart(
				data.project_id,
				Object.assign(data, fieldsObj)
			);
			if (promptPart && data.part_type === 'file' && fileContents)
				promptPart.content = fileContents;
			res
				.status(201)
				.json({ message: 'Prompt part created successfully', promptPart });
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	}
);

// Update prompt part
router.put(
	'/api/prompt_parts/:id',
	check('id').isNumeric(),
	check('position').optional().isNumeric(),
	check(['name', 'content', 'summary']).optional().isString(),
	check(['use_summary', 'use_title', 'included']).optional().isBoolean(),
	validateRequest,
	async (req, res) => {
		const data = req.body;
		const { id, name, content } = data;

		const optionalFields: (keyof Prompt_Part)[] = [
			'name',
			'content',
			'summary',
			'position',
			'included',
			'use_title',
			'use_summary',
		];

		const promptPart = await helper.getPromptPartById(id);
		if (!promptPart) {
			return res.status(404).json({ error: 'Prompt part not found' });
		}
		const fieldsObj: Partial<Prompt_Part> = {
			updated_at: new Date() as any,
		};
		for (const field of optionalFields) {
			if (field in req.body) fieldsObj[field] = req.body[field];
		}

		let fileContents: string | undefined;
		if (promptPart.part_type === 'file') {
			const projectBasePath = await getProjectPathLookup(promptPart.project_id);
			if (name && name !== promptPart.name) {
				console.log('Renaming file');
				const oldPath = path.join(projectBasePath, promptPart.name);
				const newPath = path.join(projectBasePath, name);
				await renameFile(oldPath, newPath);
			}
			const p = path.join(projectBasePath, name || promptPart.name);
			if (content) {
				await writeFileContents(p, content);
				fileContents = content;
			} else {
				fileContents = await readFileContents(p);
			}
			if (fieldsObj.content) delete fieldsObj.content;
		}

		try {
			await helper.updatePromptPart(id, fieldsObj);
			const promptPart = (await helper.getPromptPartById(id)) as Prompt_Part;
			if (promptPart.part_type === 'file')
				promptPart.content = fileContents as string;
			res
				.status(200)
				.json({ message: 'Prompt part updated successfully', promptPart });
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	}
);

// Delete prompt part
router.delete(
	'/api/prompt_parts/:id',
	check('id').isNumeric(),
	validateRequest,
	async (req, res) => {
		const data = req.body;

		if (!data.id) {
			return res.status(400).json({ error: 'Missing required fields' });
		}

		try {
			const promptPart = await helper.getPromptPartById(data.id);
			if (!promptPart) {
				return res.status(404).json({ error: 'Prompt part not found' });
			}
			if (promptPart.part_type === 'file') {
				const p = await getProjectPathLookup(
					promptPart.project_id,
					promptPart.name
				);
				if (await fileExists(p)) {
					await deleteFile(p);
					console.log('Deleted file', p);
				}
			}

			await helper.deletePromptPart(data.id);
			res
				.status(200)
				.json({ message: 'Prompt part deleted successfully', promptPart });
		} catch (err: any) {
			console.log(err);
			res.status(500).json({ error: err.message });
		}
	}
);

export default router;
