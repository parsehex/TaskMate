import { MessageHandlers } from '../shared/types/ws/index.js';
import filesHandlers from './api/files.js';
import snippetsHandlers from './api/snippets.js';
import projectsHandlers from './api/projects.js';
import utilsHandlers from './api/utils.js';

const allHandlers = {
	...filesHandlers,
	...snippetsHandlers,
	...projectsHandlers,
	...utilsHandlers,
} as MessageHandlers;

export async function setupIpcHandlers() {
	const { ipcMain } = await import('electron');

	ipcMain.on('ws-message', async (event, message) => {
		const data = JSON.parse(message);
		const endpoint = data.endpoint as keyof MessageHandlers;
		const args = data.args as any[];
		if (allHandlers[endpoint]) {
			try {
				const func = allHandlers[endpoint] as (...args: any[]) => any;
				const result = await func(...args);
				event.reply('ws-reply', JSON.stringify({ id: data.id, result }));
			} catch (error: any) {
				event.reply(
					'ws-reply',
					JSON.stringify({ id: data.id, error: error.message })
				);
			}
		}
	});
}
