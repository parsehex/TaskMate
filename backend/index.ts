import { ensureEnvVars } from './env.js';
import { startServer } from './server.js';
import { initializeDatabase } from './db/index.js';
import { scanProjectsRoot } from './project-scanner.js';
import { setupIpcHandlers } from './ipc.js';

(async () => {
	await ensureEnvVars();
	await initializeDatabase();
	await scanProjectsRoot();

	if (process.env.IS_ELECTRON === 'true') {
		console.log('Running in Electron - setting up IPC...');
		await setupIpcHandlers();
	}

	startServer();
})();
