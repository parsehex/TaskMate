import express from 'express';
import cors from 'cors';
import path from 'path';
// import Router from 'express-static-gzip';
import projectsRouter from './routes/projects.js';
import promptsRouter from './routes/prompt_parts.js';
import { initializeDatabase } from './db/index.js';
import { scanProjectsRoot } from './project-scanner.js';
import { getTokenCount } from './tokenizer.js';
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

console.log('Starting server...');

const app = express();
const port = 8080;

export const startServer = async () => {
	await initializeDatabase();
	console.log('Initialized database');

	// scans and populates database with projects and prompt parts according to project folder files
	await scanProjectsRoot();
	console.log('Scanned projects root');

	app.use(cors());
	app.use(express.json());

	const staticPath = path.join(__dirname, '../frontend');
	app.use(express.static(staticPath));

	app.use(projectsRouter);
	app.use(promptsRouter);

	// app.use('/', Router(staticPath, { enableBrotli: true }));

	app.get('/', (req, res) => {
		res.sendFile(path.join(staticPath, 'index.html'));
	});

	// helper api endpoint to count the tokens of given text
	app.post('/api/count_tokens', async (req, res) => {
		const { text } = req.body;
		if (!text) {
			res.status(200).json({ token_count: 0 });
			return;
		}
		const token_count = getTokenCount(text);
		res.status(200).json({ token_count });
	});

	app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});
};
