import { FileBooleanColumns } from '../api/files';
import { convertBooleans } from '../api/utils';
import { useStore } from '../state';

let socket: WebSocket;
let isElectron = (window as any).electron !== undefined;
let replyChannels = {};

export function initWebsocket() {
	return new Promise((resolve) => {
		const { setIsConnected } = useStore.getState();
		if (isElectron) {
			console.log('Running in Electron - using IPC');
			setIsConnected(true);
			resolve(true);
			return;
		}
		const port =
			(window as any).electron?.WEBSOCKET_PORT ||
			(process.env.WEBSOCKET_PORT as string) ||
			8585;
		console.log(`Connecting to WebSocket on port ${port}`);

		socket = new WebSocket(`ws://localhost:${port}/ws`);

		socket.onopen = () => {
			console.log('Connection opened!');
			setIsConnected(true);
			resolve(true);
		};

		socket.onmessage = (event) => {
			const data = JSON.parse(event.data);
			const { setFiles } = useStore.getState();

			switch (data.topic) {
				case 'file.added':
					console.log('File added:', data.args);
					const [projectId, file] = data.args;
					const files = useStore.getState().files;
					setFiles([...files, convertBooleans(file, FileBooleanColumns)]);
					break;
				case 'file.removed':
					console.log('File removed:', data.args);
					const [projId, fileId] = data.args;
					const currFiles = useStore.getState().files;
					setFiles(currFiles.filter((file) => file.id !== fileId));
					break;
				default:
					break;
			}
		};

		socket.onerror = (event) => {
			console.error('WebSocket error:', event);
			useStore.getState().setIsConnected(false);
		};

		socket.onclose = () => {
			console.error('WebSocket closed.');
			useStore.getState().setIsConnected(false);
		};
	});
}

export function call(endpoint: string, args: any[]): Promise<any> {
	return new Promise(async (resolve, reject) => {
		const id = Math.random().toString(36).substr(2, 9);
		const message = JSON.stringify({
			id,
			endpoint,
			args,
		});

		if (isElectron && (window as any).electron) {
			const { ipcRendererSend, ipcRendererRemoveListener, ipcRendererOn } = (
				window as any
			).electron;
			ipcRendererSend('ws-message', message);
			replyChannels[id] = (event, reply) => {
				const data = JSON.parse(reply);
				if (data.id === id) {
					if (data.error) {
						reject(new Error(data.error));
					} else {
						resolve(data.result);
					}
					ipcRendererRemoveListener('ws-reply', replyChannels[id]);
					delete replyChannels[id];
				}
			};
			ipcRendererOn('ws-reply', replyChannels[id]);
			return;
		}

		socket.send(message);

		const handleMessage = (event: MessageEvent) => {
			const data = JSON.parse(event.data);
			// console.log('Received data:', data);
			if (data.id === id) {
				if (data.error) {
					reject(new Error(data.error));
				} else {
					resolve(data.result);
				}
				socket.removeEventListener('message', handleMessage);
			}
		};

		socket.addEventListener('message', handleMessage);
	});
}
