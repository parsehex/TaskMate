import express from 'express';
import path from 'path';
import { db } from '../database';
import {
	insertStatement,
	updateStatement,
	deleteStatement,
} from '../sql-utils';
import {
	deleteFile,
	readFileContents,
	renameFile,
	writeFileContents,
} from '../fs-utils';
import { getTokenCount } from '../tokenizer';

const router = express.Router();

// Get all prompt parts
router.get('/api/prompt_parts', async (req, res) => {
	try {
		const promptParts: any[] = await db.all('SELECT * FROM prompt_parts');
		for (const promptPart of promptParts) {
			if (promptPart.part_type === 'file') {
				const project_id = promptPart.project_id;
				const project: any = await db.get(
					'SELECT name FROM projects WHERE id = ?',
					[project_id]
				);

				if (!project) {
					// if project doesn't exist splice from results
					promptParts.splice(promptParts.indexOf(promptPart), 1);
					continue;
				}
				const p = path.join(
					process.env.PROJECTS_ROOT as string,
					project.name,
					promptPart.name
				);
				promptPart.content = await readFileContents(p);
				// console.log('Read file contents');
			}
		}
		res.status(200).json(promptParts);
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

// Get prompt parts by project id
router.get('/api/prompt_parts/:project_id', async (req, res) => {
	const { project_id } = req.params;
	try {
		const promptParts: any[] = await db.all(
			'SELECT * FROM prompt_parts WHERE project_id = ?',
			[project_id]
		);

		// Add file content to each file prompt part
		for (const promptPart of promptParts) {
			if (promptPart.part_type === 'file') {
				const project: any = await db.get(
					'SELECT name FROM projects WHERE id = ?',
					[project_id]
				);
				const p = path.join(
					process.env.PROJECTS_ROOT as string,
					project.name,
					promptPart.name
				);
				promptPart.content = await readFileContents(p);
			}
		}

		res.status(200).json(promptParts);
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

// Get prompt part token count by id
router.get('/api/prompt_parts/:id/token_count', async (req, res) => {
	const { id } = req.params;
	try {
		const promptPart: any = await db.get(
			'SELECT * FROM prompt_parts WHERE id = ?',
			[id]
		);
		if (!promptPart) {
			return res.status(404).json({ error: 'Prompt part not found' });
		}
		if (promptPart.part_type === 'file') {
			const project: any = await db.get(
				'SELECT name FROM projects WHERE id = ?',
				[promptPart.project_id]
			);
			const p = path.join(
				process.env.PROJECTS_ROOT as string,
				project.name,
				promptPart.name
			);
			promptPart.content = await readFileContents(p);
		}
		res.status(200).json({ token_count: getTokenCount(promptPart.content) });
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

// Create new prompt part
router.post('/api/prompt_parts', async (req, res) => {
	const { name, project_id, part_type } = req.body;

	if (!name || !project_id || !part_type) {
		return res.status(400).json({ error: 'Missing required fields' });
	}

	try {
		const existingPromptParts = await db.all(
			'SELECT id FROM prompt_parts WHERE project_id = ?',
			[project_id]
		);
		const position = existingPromptParts.length + 1;

		const { sql, values } = insertStatement('prompt_parts', {
			name,
			project_id,
			content: '',
			part_type,
			position,
			created_at: new Date(),
			updated_at: new Date(),
		});

		const q = await db.run(sql, values);
		const promptPart = await db.get('SELECT * FROM prompt_parts WHERE id = ?', [
			q.lastID,
		]);
		res
			.status(201)
			.json({ message: 'Prompt part created successfully', promptPart });
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

// Update prompt part
router.put('/api/prompt_parts/:id', async (req, res) => {
	const { id } = req.params;
	const { name, content, position, included } = req.body;

	if (
		!name &&
		!content &&
		!Number.isInteger(position) &&
		included === undefined
	) {
		return res.status(400).json({ error: 'Missing required fields' });
	}

	const promptPart: any = await db.get(
		'SELECT part_type, project_id, name FROM prompt_parts WHERE id = ?',
		[id]
	);

	const fieldsObj = { name, content, position, included };
	if (promptPart.part_type === 'file') {
		const project: any = await db.get(
			'SELECT name FROM projects WHERE id = ?',
			[promptPart.project_id]
		);
		if (name && name !== promptPart.name) {
			console.log('Renaming file');
			const oldPath = path.join(
				process.env.PROJECTS_ROOT as string,
				project.name,
				promptPart.name
			);
			const newPath = path.join(
				process.env.PROJECTS_ROOT as string,
				project.name,
				name
			);
			await renameFile(oldPath, newPath);
		}
		const p = path.join(
			process.env.PROJECTS_ROOT as string,
			project.name,
			name || promptPart.name
		);
		if (content) await writeFileContents(p, content);
		delete fieldsObj.content;
	}

	if (!name) delete fieldsObj.name;
	if (!Number.isInteger(position)) delete fieldsObj.position;
	if (included === undefined) delete fieldsObj.included;
	if (!content) delete fieldsObj.content;

	(fieldsObj as any).updated_at = new Date();

	try {
		const { sql, values } = updateStatement('prompt_parts', fieldsObj, { id });

		const q = await db.run(sql, ...values);
		if (q.changes === 0) {
			return res.status(404).json({ error: 'Prompt part not found' });
		}
		res.status(200).json({ message: 'Prompt part updated successfully' });
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

// Delete prompt part
router.delete('/api/prompt_parts/:id', async (req, res) => {
	const { id } = req.params;

	try {
		const promptPart: any = await db.get(
			'SELECT part_type, project_id, name FROM prompt_parts WHERE id = ?',
			[id]
		);
		if (promptPart.part_type === 'file') {
			const project: any = await db.get(
				'SELECT name FROM projects WHERE id = ?',
				[promptPart.project_id]
			);
			const p = path.join(
				process.env.PROJECTS_ROOT as string,
				project.name,
				promptPart.name
			);
			await deleteFile(p);
		}

		const sql = deleteStatement('prompt_parts', { id });
		const q = await db.run(sql);
		if (q.changes === 0) {
			return res.status(404).json({ error: 'Prompt part not found' });
		}
		res.status(200).json({ message: 'Prompt part deleted successfully' });
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

export default router;
