import { encode } from 'gpt-tokenizer';

const cache = new Map<string, number[]>();

export function getTokenCount(text: string): number {
	if (!text || text.length === 0) return 0;
	if (cache.has(text)) {
		return cache.get(text)!.length;
	}

	const tokens = encode(text);
	cache.set(text, tokens);
	return tokens.length;
}
