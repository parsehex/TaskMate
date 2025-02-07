import { app, BrowserWindow, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { spawn } from 'child_process';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const ENV_PATH = path.resolve(__dirname, '.env');

dotenv.config({ path: ENV_PATH });

let mainWindow: BrowserWindow | null = null;
let envSetupWindow: BrowserWindow | null = null;
let backendProcess: any = null;

const REQUIRED_ENV_VARS = [
	'PROJECTS_ROOT',
	'DATABASE_PATH',
	'SERVER_PORT',
	'WEBSOCKET_PORT',
];

function isEnvComplete() {
	return REQUIRED_ENV_VARS.every((key) => process.env[key]);
}

const createMainWindow = () => {
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: { nodeIntegration: false, contextIsolation: true },
	});

	mainWindow.loadURL('http://localhost:8080');
	mainWindow.on('closed', () => {
		mainWindow = null;
		if (backendProcess) {
			backendProcess.kill();
		}
	});
};

const createEnvSetupWindow = () => {
	envSetupWindow = new BrowserWindow({
		width: 600,
		height: 400,
		resizable: false,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.join(__dirname, 'preload.js')
		 },
	});

	envSetupWindow.loadFile(path.join(__dirname, './env-setup.html'));
	envSetupWindow.on('closed', () => (envSetupWindow = null));
};

ipcMain.on('save-env', (_, envData) => {
	const envContent = Object.entries(envData)
		.map(([key, value]) => `${key}=${value}`)
		.join('\n');

	console.log(envContent);
	fs.writeFileSync(ENV_PATH, envContent, { flag: 'w' });
	// app.relaunch();
	app.quit();
});


app.on('ready', async () => {
	const preloadScript = `
			const { contextBridge, ipcRenderer } = require('electron');
			contextBridge.exposeInMainWorld('electron', {
					saveEnv: (data) => ipcRenderer.send('save-env', data)
			});
	`;
	fs.writeFileSync(path.join(__dirname, 'preload.js'), preloadScript);

	if (!isEnvComplete()) {
		createEnvSetupWindow();
	} else {
		// Start the backend server
		backendProcess = spawn('node', ['dist/backend/index.js'], {
			stdio: 'inherit',
			shell: true,
		});
		createMainWindow();
	}
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
