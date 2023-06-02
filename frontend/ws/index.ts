import autobahn from 'autobahn';
import { File } from '../../shared/types/index.js';
import { FileBooleanColumns } from '../api/files';
import { convertBooleans } from '../api/utils';
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
			const { setIsConnected, setFiles } = useStore.getState();
			console.log('Connection opened!2');
			setIsConnected(true);
			s.subscribe('file.added', (args: [number, File] | undefined) => {
				console.log('File added:', args);
				if (!args) return;
				const [projectId, file] = args;
				const files = useStore.getState().files;
				setFiles([...files, convertBooleans(file, FileBooleanColumns)]);
			});
			s.subscribe('file.removed', (args: [number, number] | undefined) => {
				console.log('File removed:', args);
				if (!args) return;
				const [projectId, fileId] = args;
				const files = useStore.getState().files;
				setFiles(files.filter((file) => file.id !== fileId));
			});
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
