import express from 'express';
import { db } from '../db';
import {
	deleteStatement,
	insertStatement,
	updateStatement,
} from '../db/sql-utils';
import path from 'path';
import fs from 'fs';

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
		const projects = await db.all('SELECT * FROM projects');
		res.status(200).json(projects);
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

router.post('/api/projects', async (req, res) => {
	const { name } = req.body;

	if (!name) {
		return res.status(400).json({ error: 'Missing required fields' });
	}

	const directories = await getDirectories();
	if (!directories.includes(name)) {
		return res.status(400).json({ error: 'Invalid project name' });
	}

	try {
		const { sql, values } = insertStatement('projects', {
			name,
		});
		const q = await db.run(sql, values);
		const project = await db.get('SELECT * FROM projects WHERE id = ?', [
			q.lastID,
		]);
		res.status(201).json({ message: 'Project created successfully', project });
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

router.get('/api/projects/listDirectories', (req, res) => {
	// Replace this with the appropriate path where project folders are stored on your server
	const basePath = path.resolve(process.env.PROJECTS_ROOT as string);

	fs.readdir(basePath, { withFileTypes: true }, (err, items) => {
		if (err) {
			res.status(500).send({ error: err.message });
			return;
		}

		const directories = items
			.filter((item) => item.isDirectory())
			.map((dir) => dir.name);
		res.send(directories);
	});
});

router.put('/api/projects/:id', async (req, res) => {
	const { id } = req.params;
	const { name, description } = req.body;

	if (!name && !description) {
		return res.status(400).json({ error: 'Missing required fields' });
	}

	const directories = await getDirectories();
	if (name && !directories.includes(name)) {
		return res.status(400).json({ error: 'Invalid folder path' });
	}

	try {
		const { sql, values } = updateStatement(
			'projects',
			{ name, description },
			{ id: +id }
		);
		// console.log({ name, description, folder_path }, { id: +id }, sql, values);

		const q = await db.run(sql, ...values);
		if (q.changes === 0) {
			return res.status(404).json({ error: 'Project not found' });
		}
		res.status(200).json({ message: 'Project updated successfully' });
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

router.delete('/api/projects/:id', async (req, res) => {
	const { id } = req.params;

	try {
		const { sql, values } = deleteStatement('projects', { id: +id });
		const q = await db.run(sql, ...values);
		if (q.changes === 0) {
			return res.status(404).json({ error: 'Project not found' });
		}
		res.status(200).json({ message: 'Project deleted successfully' });
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

export default router;
