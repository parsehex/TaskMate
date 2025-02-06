import { ensureEnvVars } from './env.js';
import { startServer } from './server.js';

(async () => {
	await ensureEnvVars();
	startServer();
})();
