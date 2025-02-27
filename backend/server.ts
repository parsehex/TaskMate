import express from 'express';
import cors from 'cors';
import path from 'path';
import * as url from 'url';
import './api/index.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

console.log('Starting server...');

const app = express();

export const startServer = async () => {
	try {
		app.use(cors());
		app.use(express.json());

		const staticPath = path.join(__dirname, '../'); // .dist/
		app.use(express.static(staticPath));

		app.get('/', (req, res) => {
			res.sendFile(path.join(staticPath, 'frontend/index.html'));
		});

		const port = +(process.env.SERVER_PORT as string) || 3000;
		app.listen(port, () => {
			console.log(`Server is running on port ${port}`);
		});
	} catch (error) {
		console.error('Error starting the server:', error);
	}
};
