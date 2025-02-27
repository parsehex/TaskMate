import fs from 'fs-extra';
import path from 'path';
import { EventEmitter } from 'events';

const emitter = new EventEmitter();

// Determine config file location based on whether we’re running under Electron.
const CONFIG_FILENAME = 'config.json';

async function getConfigPath() {
	let configDir = process.cwd();
	if (process.env.IS_ELECTRON === 'true') {
		const { app } = await import('electron');
		configDir = app.getPath('userData');
	}
	return path.resolve(configDir, CONFIG_FILENAME);
}

// Default config values:
const defaultConfig = {
	PROJECTS_ROOT: path.resolve(process.cwd(), 'projects'),
	SERVER_PORT: '8080',
	WEBSOCKET_PORT: '8585',
	OPENAI_API_KEY: '',
};

let configCache: Record<string, string> = { ...defaultConfig };

export function getConfig() {
	return configCache;
}

export async function loadConfig() {
	try {
		const CONFIG_PATH = await getConfigPath();
		if (await fs.pathExists(CONFIG_PATH)) {
			const fileConfig = await fs.readJSON(CONFIG_PATH);
			configCache = { ...defaultConfig, ...fileConfig };
		} else {
			// Create the file with defaults if missing.

			if (process.env.IS_ELECTRON === 'true') {
				const { app } = await import('electron');
				configCache.PROJECTS_ROOT = path.resolve(
					app.getPath('userData'),
					'projects'
				);
				await fs.ensureDir(configCache.PROJECTS_ROOT);
			}

			await saveConfig(configCache);
		}

		// Load as env to ensure backwards compatibility -- avoid breaking anything for now
		const keys = Object.keys(configCache);
		for (const key of keys) {
			process.env[key] = configCache[key];
		}
	} catch (e) {
		console.error('Error loading configuration:', e);
	}
	return configCache;
}

export async function saveConfig(newConfig: Record<string, string>) {
	configCache = { ...configCache, ...newConfig };
	await fs.writeJSON(await getConfigPath(), configCache, { spaces: 2 });
	emitter.emit('change', configCache);
	return configCache;
}

export async function watchConfig() {
	const CONFIG_PATH = await getConfigPath();
	fs.watch(CONFIG_PATH, async (eventType) => {
		if (eventType === 'change') {
			try {
				const updatedConfig = await fs.readJSON(CONFIG_PATH);
				configCache = { ...defaultConfig, ...updatedConfig };
				emitter.emit('change', configCache);
			} catch (e) {
				console.error('Error reading updated config:', e);
			}
		}
	});
	// Consumers can subscribe to changes (e.g. watchConfig().on(...))
	return emitter;
}
