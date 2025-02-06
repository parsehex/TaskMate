import express from 'express';
import cors from 'cors';
import path from 'path';
import * as url from 'url';
import { initializeDatabase } from './db/index.js';
import './ws/index.js';
import { scanProjectsRoot } from './project-scanner.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

console.log('Starting server...');

const app = express();
const port = +(process.env.SERVER_PORT as string) || 3000;

export const startServer = async () => {
	try {
		await initializeDatabase();
		console.log('Initialized database');

		// scans and populates database with projects and prompt parts according to project folder files
		await scanProjectsRoot();
		console.log('Scanned projects root');

		app.use(cors());
		app.use(express.json());

		const staticPath = path.join(__dirname, '../frontend');
		app.use(express.static(staticPath));

		app.get('/', (req, res) => {
			res.sendFile(path.join(staticPath, 'index.html'));
		});
		app.post('/rescan-projects', async (req, res) => {
			try {
				await scanProjectsRoot();
				res.json({ success: true, message: 'Projects rescanned.' });
			} catch (error: any) {
				res.status(500).json({ success: false, error: error.message });
			}
		});

		app.listen(port, () => {
			console.log(`Server is running on port ${port}`);
		});
	} catch (error) {
		console.error('Error starting the server:', error);
	}
};
