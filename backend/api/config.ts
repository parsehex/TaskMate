import type { ConfigMessageHandlers } from '../../shared/types/ws/index.js';
import { getConfig, saveConfig } from '../config-manager.js';
import { sendToAll } from './index.js';

async function GET_CONFIG() {
	return getConfig();
}

async function UPDATE_CONFIG(newConfig: Record<string, string>) {
	const currentConfig = getConfig();
	const criticalKeys = ['PROJECTS_ROOT', 'SERVER_PORT', 'WEBSOCKET_PORT'];
	const requiresRestart = criticalKeys.some(
		(key) => currentConfig[key] !== newConfig[key]
	);

	const updated = await saveConfig(newConfig);
	// Broadcast update so UI can refresh
	sendToAll('config.updated', [updated]);

	// For critical changes, inform the UI to prompt for a restart.
	if (requiresRestart) {
		sendToAll('config.updatedCritical', []);
	}
	return updated;
}

const handlers: ConfigMessageHandlers = {
	GET_CONFIG,
	UPDATE_CONFIG,
};

export default handlers;
