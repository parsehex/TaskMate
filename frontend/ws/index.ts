import autobahn from 'autobahn';
import { useStore } from '../state';

let connection: autobahn.Connection | null = null;
let session: autobahn.Session | null = null;

const port = +(process.env.WEBSOCKET_PORT as string) || 8181;

export async function initWebsocket() {
	console.log(`Connecting to WebSocket on port ${port}`);

	connection = new autobahn.Connection({
		url: `ws://localhost:${port}/ws`,
		realm: 'realm1',
	});

	session = await new Promise<autobahn.Session>((resolve, reject) => {
		if (!connection) throw new Error('Connection is not initialized yet.');
		connection.onopen = (s) => {
			console.log('Connection opened!');
			useStore.getState().setIsConnected(true);
			resolve(s);
		};
		connection.onclose = (reason, details) => {
			console.error('Connection closed. Reason: ' + reason);
			useStore.getState().setIsConnected(false);
			reject(new Error(reason));
			return false;
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
