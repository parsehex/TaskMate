import { ensureEnvVars } from './env.js';
import { startServer } from './server.js';
import { initializeDatabase } from './db/index.js';
import { scanProjectsRoot } from './project-scanner.js';
import { setupIpcHandlers } from './ipc.js';

let isDone = false;

export function waitUntilStarted() {
	return new Promise((resolve) => {
		if (isDone) resolve(true);
		const id = setInterval(() => {
			if (!isDone) return;
			clearInterval(id);
			resolve(true);
		}, 250);
	})
}

(async () => {
	await ensureEnvVars();
	await initializeDatabase();
	console.log('Initialized database');
	await scanProjectsRoot();
	console.log('Scanned projects root');

	if (process.env.IS_ELECTRON === 'true') {
		console.log('Running in Electron - setting up IPC...');
		setupIpcHandlers();
	} else {
		console.log('Starting server');
		startServer();
	}
	isDone = true;
})();
