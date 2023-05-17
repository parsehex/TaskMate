import autobahn from 'autobahn';

const port = +(process.env.WEBSOCKET_PORT as string) || 8081;

const connection = new autobahn.Connection({
	url: `ws://127.0.0.1:${port}`,
	realm: 'realm1',
});

let session: autobahn.Session | null = null;

connection.onopen = function (s) {
	session = s;
};

connection.open();

export function getSession(): autobahn.Session {
	if (session) {
		return session;
	} else {
		throw new Error('WebSocket session is not open yet.');
	}
}
