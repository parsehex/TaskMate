import ConfigHandlers from '@/lib/ws/config';

export async function fetchConfig(): Promise<Record<string, string>> {
	return await ConfigHandlers.GET_CONFIG();
}

export async function updateConfig(
	config: Record<string, string>
): Promise<Record<string, string>> {
	return await ConfigHandlers.UPDATE_CONFIG(config);
}
