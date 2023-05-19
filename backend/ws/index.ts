import autobahn from 'autobahn';
import filesHandlers from './files.js';
import snippetsHandlers from './snippets.js';
import projectsHandlers from './projects.js';
import utilsHandlers from './utils.js';
import { MessageHandlers } from '../../shared/types/ws/index.js';

let connection: autobahn.Connection | null = null;
let session: autobahn.Session | null = null;

const port = +(process.env.WEBSOCKET_PORT as string) || 8181;

const allHandlers = {
	...filesHandlers,
	...snippetsHandlers,
	...projectsHandlers,
	...utilsHandlers,
} as MessageHandlers;

export async function initWebsocket() {
	connection = new autobahn.Connection({
		url: `ws://localhost:${port}/ws`,
		realm: 'realm1',
	});

	session = await new Promise<autobahn.Session>((resolve) => {
		if (!connection) throw new Error('Connection is not initialized yet.');
		connection.onopen = (s) => {
			// console.log('Connection opened!');
			Object.entries(allHandlers).forEach(([endpoint, handler]) => {
				s.register(`${endpoint}`, (args: any[] | undefined) => {
					if (!args) return handler();
					return handler(...args);
				});
			});
			resolve(s);
		};
		connection.open();
	});
}

export function getSession(): autobahn.Session {
	if (session) {
		return session;
	} else {
		throw new Error('WebSocket session is not open yet.');
	}
}
