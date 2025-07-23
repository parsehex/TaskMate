import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import rememberWindowState, { loadWindowState } from './window-state.js';
import fs from 'fs/promises';
import path from 'path';
import * as url from 'url';
import {
	installExtension,
	REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

let mainWindow: BrowserWindow | null = null;

// Writes a preload script that exposes an electron API
async function writePreloadScript(content: string) {
	await fs.writeFile(path.resolve(__dirname, '../../../preload.js'), content);
}

const createMainWindow = async () => {
	await writePreloadScript(`
    console.log('Preload ran');
    const { contextBridge, ipcRenderer } = require('electron');
    contextBridge.exposeInMainWorld('electron', {
      IS_CHAT_ENABLED: ${!!process.env.OPENAI_API_KEY},
      ipcRendererSend: ipcRenderer.send.bind(ipcRenderer),
      ipcRendererOn: ipcRenderer.on.bind(ipcRenderer),
      ipcRendererRemoveListener: ipcRenderer.removeListener.bind(ipcRenderer),
      selectFolder: async () => {
        // Calls the main process, returning the selected folder path.
        return await ipcRenderer.invoke('select-folder');
      },
      restartApp: () => {
        ipcRenderer.send('restart-app');
      }
    });
  `);

	// Flag that we’re running in Electron.
	process.env.IS_ELECTRON = 'true';

	const windowState = loadWindowState({
		width: 1200,
		height: 800,
	});
	mainWindow = new BrowserWindow({
		width: windowState.width,
		minWidth: 600,
		height: windowState.height,
		minHeight: 400,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.resolve(__dirname, '../../../preload.js'),
		},
	});

	mainWindow.loadFile(path.resolve(__dirname, '../frontend/index.html'));

	if (process.env.NODE_ENV !== 'production') {
		mainWindow.webContents.openDevTools();
	}

	return mainWindow;
};

ipcMain.handle('select-folder', async () => {
	if (!mainWindow) {
		return null;
	}
	const result = await dialog.showOpenDialog(mainWindow, {
		properties: ['openDirectory'],
	});
	if (result.canceled || result.filePaths.length === 0) {
		return null;
	}
	return result.filePaths[0];
});

ipcMain.on('restart-app', () => {
	app.relaunch();
	app.exit();
});

app.on('ready', async () => {
	if (process.env.NODE_ENV !== 'production') {
		try {
			const name = await installExtension(REACT_DEVELOPER_TOOLS);
			console.log(`Added Extension:  ${name}`);
		} catch (err) {
			console.log('An error occurred installing devtools: ', err);
		}
	}

	console.log('Starting backend', path.resolve(__dirname, '../backend'));
	const win = await createMainWindow();
	rememberWindowState(win);
	// Dynamically load backend after creating window.
	const backendProcess = await import(
		'file://' + path.resolve(__dirname, '../backend/index.js')
	);
	await backendProcess.waitUntilStarted();
	win?.reload();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
