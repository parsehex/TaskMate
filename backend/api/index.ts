import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import filesHandlers from './files.js';
import snippetsHandlers from './snippets.js';
import projectsHandlers from './projects.js';
import utilsHandlers from './utils.js';
import configHandlers from './config.js';
import { MessageHandlers, WSMessage } from '../../shared/types/ws/index.js';

let wss: WebSocketServer;
const clients: { [id: string]: WebSocket } = {};

export const allHandlers = {
	...filesHandlers,
	...snippetsHandlers,
	...projectsHandlers,
	...utilsHandlers,
	...configHandlers,
} as MessageHandlers;

export function initializeWebSocket() {
	const port = +(process.env.WEBSOCKET_PORT as string) || 8585;
	wss = new WebSocketServer({ port });

	wss.on('connection', onConnect);
}

export function sendToAll(topic: string, args: any[]) {
	Object.values(clients).forEach((client) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify({ topic, args }));
		}
	});
}

function onConnect(ws: WebSocket) {
	const clientId = uuidv4();
	clients[clientId] = ws;

	ws.on('message', async (message) => {
		const data: WSMessage = JSON.parse(message.toString());

		if (allHandlers[data.endpoint]) {
			// @ts-ignore
			allHandlers[data.endpoint](...data.args)
				.then((result) => {
					ws.send(
						JSON.stringify({
							id: data.id,
							result,
						})
					);
				})
				.catch((error) => {
					console.error(data.endpoint, 'error', error);
					ws.send(
						JSON.stringify({
							id: data.id,
							error: error.message,
						})
					);
				});
		}
	});

	ws.on('close', () => {
		delete clients[clientId];
	});
}
