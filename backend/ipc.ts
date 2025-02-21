import type { MessageHandlers } from '../shared/types/ws/index.js';
import { allHandlers } from './api/index.js';

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
