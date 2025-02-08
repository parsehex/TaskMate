import { app, BrowserWindow, ipcMain } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const ENV_PATH = path.resolve(app.getPath('userData'), '.env');

dotenv.config({ path: ENV_PATH });

let mainWindow: BrowserWindow | null = null;
let envSetupWindow: BrowserWindow | null = null;

const REQUIRED_ENV_VARS = ['PROJECTS_ROOT', 'SERVER_PORT', 'WEBSOCKET_PORT'];

function isEnvComplete() {
	return REQUIRED_ENV_VARS.every((key) => process.env[key]);
}

async function writePreloadScript(content: string) {
	await fs.writeFile(path.resolve(__dirname, '../../preload.js'), content);
}

const createMainWindow = async () => {
	await writePreloadScript(`
			console.log('Preload ran');
			const { contextBridge, ipcRenderer } = require('electron');
			contextBridge.exposeInMainWorld('electron', {
					SERVER_PORT: ${process.env.SERVER_PORT},
					WEBSOCKET_PORT: ${process.env.WEBSOCKET_PORT}
			});
	`);

	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.resolve(__dirname, '../../preload.js'),
		},
	});

	// TODO env value validation
	mainWindow.loadURL('http://localhost:' + process.env.SERVER_PORT);
};

const createEnvSetupWindow = async () => {
	await writePreloadScript(`
			console.log('Preload ran');
			const { contextBridge, ipcRenderer } = require('electron');
			contextBridge.exposeInMainWorld('electron', {
					saveEnv: (data) => ipcRenderer.send('save-env', data)
			});
	`);

	envSetupWindow = new BrowserWindow({
		width: 600,
		height: 500,
		resizable: false,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.resolve(__dirname, '../../preload.js'),
		},
	});

	envSetupWindow.loadFile(path.join(__dirname, './env-setup.html'));
	envSetupWindow.on('closed', () => (envSetupWindow = null));
};

ipcMain.on('save-env', async (_, envData) => {
	const envContent = Object.entries(envData)
		.map(([key, value]) => `${key}=${value}`)
		.join('\n');

	console.log(envContent);
	await fs.writeFile(ENV_PATH, envContent, { flag: 'w' });
	// app.relaunch();
	app.quit();
});

app.on('ready', async () => {
	if (!isEnvComplete()) {
		createEnvSetupWindow();
	} else {
		console.log('Starting backend', path.resolve(__dirname, 'backend'));
		await import('file://' + path.resolve(__dirname, 'backend/index.js'));
		createMainWindow();
	}
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
