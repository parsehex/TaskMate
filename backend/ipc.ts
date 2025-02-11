import { MessageHandlers } from '../shared/types/ws/index.js';
import filesHandlers from './ws/files.js';
import snippetsHandlers from './ws/snippets.js';
import projectsHandlers from './ws/projects.js';
import utilsHandlers from './ws/utils.js';

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

