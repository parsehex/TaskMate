import path from 'path';
import fs from 'fs';
import express from 'express';
import { check } from 'express-validator';
import * as helper from '../db/helper/projects.js';
import { validateRequest } from '../express.js';

function getDirectories(): Promise<string[]> {
	return new Promise((resolve, reject) => {
		const basePath = path.resolve(process.env.PROJECTS_ROOT as string);
		fs.readdir(basePath, { withFileTypes: true }, (err, items) => {
			if (err) reject(err);

			const directories = items
				.filter((item) => item.isDirectory())
				.map((dir) => dir.name);
			resolve(directories);
		});
	});
}

const router = express.Router();

router.get('/api/projects', async (req, res) => {
	try {
		const projects = await helper.getProjects();
		res.status(200).json(projects);
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

router.post(
	'/api/projects',
	check('name').isString().notEmpty(),
	validateRequest,
	async (req, res) => {
		const { name } = req.body;

		const directories = await getDirectories();
		if (!directories.includes(name)) {
			return res.status(400).json({ error: 'Invalid project name' });
		}

		try {
			const project = await helper.createProject(name);
			res
				.status(201)
				.json({ message: 'Project created successfully', data: project });
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	}
);

router.put(
	'/api/projects/:id',
	check('id').isNumeric(),
	check(['name', 'description', 'ignore_files']).optional(),
	validateRequest,
	async (req, res) => {
		const { id, name, description, ignore_files } = req.body;

		if (!name && !description && !ignore_files) {
			return res.status(400).json({ error: 'Must update at least one field' });
		}

		const directories = await getDirectories();
		if (name && !directories.includes(name)) {
			return res.status(400).json({ error: 'Invalid folder path' });
		}

		try {
			const project = await helper.updateProject(+id, req.body);
			if (!project) {
				return res.status(404).json({ error: 'Project not found' });
			}
			res
				.status(200)
				.json({ message: 'Project updated successfully', data: project });
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	}
);

router.delete(
	'/api/projects/:id',
	check('id').isNumeric(),
	validateRequest,
	async (req, res) => {
		const { id } = req.params;

		if (!id) {
			return res.status(400).json({ error: 'Missing required fields' });
		}

		try {
			const result = await helper.deleteProject(+id);
			if (result.changes === 0) {
				return res.status(404).json({ error: 'Project not found' });
			}
			res.status(200).json({ message: 'Project deleted successfully' });
		} catch (err: any) {
			res.status(500).json({ error: err.message });
		}
	}
);

export default router;
