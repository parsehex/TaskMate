import path from 'path';
import express from 'express';
import { check } from 'express-validator';
import fs from 'fs-extra';
import { File } from '../../shared/types/index.js';
import * as helper from '../db/helper/files.js';
import { validateRequest } from '../express.js';
import { getProjectPathLookup } from '../path-utils.js';

const router = express.Router();

async function resolveFileContent(file: File) {
	const p = await getProjectPathLookup(file.project_id, file.name);
	if (!(await fs.pathExists(p))) return { drop: true };
	const content = await fs.readFile(p, 'utf-8');
	return { ...file, content };
}

router.get('/api/files', async (req, res) => {
	try {
		const files = await helper.getFiles();
		const resolvedFiles = await Promise.all(files.map(resolveFileContent)).then(
			(files) => files.filter((file) => !file.drop)
		);
		res.status(200).json(resolvedFiles);
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

router.get(
	'/api/files/:project_id',
	check('project_id').isNumeric(),
	validateRequest,
	async (req, res) => {
		const { project_id } = req.body;
		try {
			const files = await helper.getFilesByProjectId(+project_id);
			const resolvedFiles = await Promise.all(
				files.map(resolveFileContent)
			).then((files) => files.filter((file) => !file.drop));
			res.status(200).json(resolvedFiles);
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	}
);

router.post(
	'/api/files',
	check('project_id').isNumeric(),
	check('name').isString(),
	validateRequest,
	async (req, res) => {
		const { project_id, name } = req.body;
		try {
			const p = await getProjectPathLookup(+project_id, name);
			if (await fs.pathExists(p)) {
				return res.status(400).json({ error: 'File already exists' });
			}

			const newFile = await helper.createFile(+project_id, { name });
			if (!(await fs.pathExists(p))) {
				await fs.writeFile(p, '');
			}
			res
				.status(201)
				.json({ message: 'File created successfully', data: newFile });
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	}
);

router.put(
	'/api/files/:id',
	check('id').isNumeric(),
	check(['name', 'summary']).isString().optional(),
	check(['included', 'use_title', 'use_summary']).isBoolean().optional(),
	validateRequest,
	async (req, res) => {
		const { id } = req.body;
		const file = req.body as Partial<File>;
		try {
			let updatedFile = await helper.updateFile(+id, file);
			const p = await getProjectPathLookup(updatedFile.project_id, file.name);
			if (file.name && !(await fs.pathExists(p))) {
				return res.status(400).json({ error: 'File does not exist' });
			}
			if (file.name && file.name !== updatedFile.name) {
				const basePath = await getProjectPathLookup(+updatedFile.project_id);
				const oldPath = path.join(basePath, updatedFile.name);
				const newPath = path.join(basePath, file.name);
				await fs.rename(oldPath, newPath);
			}
			if (file.content) await fs.writeFile(p, file.content);
			else updatedFile = (await resolveFileContent(updatedFile)) as File;

			res
				.status(200)
				.json({ message: 'File updated successfully', data: updatedFile });
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	}
);

router.delete(
	'/api/files/:id',
	check('id').isNumeric(),
	validateRequest,
	async (req, res) => {
		const { id } = req.body;
		try {
			await helper.deleteFile(+id);
			res.status(200).json({ message: 'File deleted successfully' });
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	}
);

export default router;
