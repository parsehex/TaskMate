import autobahn from 'autobahn';
import filesHandlers from './files.js';
import snippetsHandlers from './snippets.js';
import projectsHandlers from './projects.js';
import utilsHandlers from './utils.js';
import { MessageHandlers } from '../../shared/types/ws/index.js';

const port = +(process.env.WEBSOCKET_PORT as string) || 8081;

const allHandlers = {
	...filesHandlers,
	...snippetsHandlers,
	...projectsHandlers,
	...utilsHandlers,
} as MessageHandlers;

const connection = new autobahn.Connection({
	url: `ws://127.0.0.1:${port}`,
	realm: 'realm1',
});

connection.onopen = function (session) {
	Object.entries(allHandlers).forEach(([endpoint, handler]) => {
		session.register(`${endpoint}`, handler);
	});
};

connection.open();
