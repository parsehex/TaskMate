import { startServer } from './server.js';
import { initializeDatabase } from './db/index.js';
import { scanProjectsRoot } from './project-scanner.js';
import { setupIpcHandlers } from './ipc.js';
import { loadConfig } from './config-manager.js';
import { initializeWebSocket } from './api/index.js';
import { initOpenAI } from './openai/index.js';

let isDone = false;

export function waitUntilStarted() {
	return new Promise((resolve) => {
		if (isDone) resolve(true);
		const id = setInterval(() => {
			if (!isDone) return;
			clearInterval(id);
			resolve(true);
		}, 250);
	});
}

(async () => {
	await loadConfig();

	console.log(process.env);
	await initializeDatabase();
	console.log('Initialized database');
	initOpenAI();
	await scanProjectsRoot();
	console.log('Scanned projects root');

	if (process.env.IS_ELECTRON === 'true') {
		console.log('Running in Electron - setting up IPC...');
		setupIpcHandlers();
	} else {
		console.log('Starting server');
		initializeWebSocket();
		startServer();
	}
	isDone = true;
})();
