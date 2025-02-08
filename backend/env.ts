import readline from 'readline';
import fs from 'fs';
import path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const isElectron = __dirname.includes('app.asar');

// List of required environment variables
const REQUIRED_ENV_VARS = ['PROJECTS_ROOT', 'SERVER_PORT', 'WEBSOCKET_PORT'];

// Setup CLI input
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

/**
 * Ask a question via CLI with an optional default value
 */
const askQuestion = (query: string, defaultValue?: string): Promise<string> => {
	return new Promise((resolve) => {
		const prompt = defaultValue ? `${query} [${defaultValue}]: ` : `${query}: `;
		rl.question(prompt, (answer) => {
			answer = answer.trim();
			answer = answer.replace(/"/g, '');
			resolve(answer || defaultValue || '');
		});
	});
};

/**
 * Ensure all required environment variables are set
 */
const ensureEnvVars = async () => {
	const missingVars: Record<string, string> = {};

	for (const key of REQUIRED_ENV_VARS) {
		if (process.env[key]) continue;
		const value = await askQuestion(`Enter value for ${key}`);
		missingVars[key] = value;
		process.env[key] = value;
	}

	if (Object.keys(missingVars).length > 0) {
		// Append missing variables to the .env file
		const envContents = Object.entries(missingVars)
			.map(([key, value]) => `${key}=${value}`)
			.join('\n');

		let base = [__dirname, '..'];
		if (isElectron) {
			const { app } = await import('electron');
			base = [app.getPath('userData')];
		}
		const ENV_PATH = path.resolve(...base, '.env');
		fs.appendFileSync(ENV_PATH, `\n${envContents}\n`);
		console.log('Updated .env file with missing variables.');
		console.log('Please re-run the server.');
		rl.close();
		process.exit(0);
	}

	rl.close();
};

export { ensureEnvVars };
