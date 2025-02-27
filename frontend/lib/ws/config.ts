import { ConfigMessageHandlers } from '@shared/types/ws';
import { call } from './index';

async function GET_CONFIG() {
	return await call('GET_CONFIG', []);
}

async function UPDATE_CONFIG(newConfig: Record<string, string>) {
	return await call('UPDATE_CONFIG', [newConfig]);
}

const ConfigHandlers: ConfigMessageHandlers = {
	GET_CONFIG,
	UPDATE_CONFIG,
};

export default ConfigHandlers;
