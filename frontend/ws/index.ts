import autobahn from 'autobahn';

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
			resolve(s);
		};
		connection.onclose = (reason, details) => {
			console.error('Connection closed. Reason: ' + reason);
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
