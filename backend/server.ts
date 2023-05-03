import express from 'express';
import cors from 'cors';
import path from 'path';
// import Router from 'express-static-gzip';
import projectsRouter from './routes/projects';
import promptsRouter from './routes/prompt_parts';
import { initializeDatabase } from './database';
import { scanProjectsRoot } from './project-scanner';

console.log('Starting server...');

const app = express();
const port = 8080;

export const startServer = async () => {
	await initializeDatabase();

	// scans and populates database with projects and prompt parts according to project folder files
	await scanProjectsRoot();

	app.use(cors());
	app.use(express.json());

	const staticPath = path.join(__dirname, '..');
	app.use(express.static(staticPath));

	app.use(projectsRouter);
	app.use(promptsRouter);

	// app.use('/', Router(staticPath, { enableBrotli: true }));

	app.get('/', (req, res) => {
		res.sendFile(path.join(staticPath, 'index.html'));
	});

	app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});
};
