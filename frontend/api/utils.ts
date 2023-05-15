interface GetTokenCountOptions {
	text?: string;
	fileId?: number;
	snippetId?: number;
}
interface GetTokenCountResponse {
	token_count: number;
}
export const getTokenCount = async (
	options: GetTokenCountOptions
): Promise<GetTokenCountResponse> => {
	const { text, fileId, snippetId } = options;
	if (text) {
		const response = await fetch('/api/count_tokens', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ text }),
		});
		return await response.json();
	} else if (fileId) {
		const response = await fetch(`/api/files/${fileId}/token_count`);
		return await response.json();
	} else if (snippetId) {
		const response = await fetch(`/api/snippets/${snippetId}/token_count`);
		return await response.json();
	} else {
		return { token_count: 0 };
	}
};

interface GenerateSummaryOptions {
	fileId?: number;
	snippetId?: number;
}
interface GenerateSummaryResponse {
	data: { text: string };
}
export const generateSummary = async (
	options: GenerateSummaryOptions
): Promise<GenerateSummaryResponse> => {
	const { fileId, snippetId } = options;
	if (fileId) {
		const response = await fetch(`/api/files/${fileId}/generate_summary`);
		return await response.json();
	} else if (snippetId) {
		const response = await fetch(`/api/snippets/${snippetId}/generate_summary`);
		return await response.json();
	} else {
		return { data: { text: '' } };
	}
};

// helper function to convert sqlite's 0/1 to boolean based on column names
export const convertBooleans = (obj: any, columns: string[]): any => {
	for (const column of columns) {
		if (obj[column] === undefined) continue;
		if (obj[column] === 0) obj[column] = false;
		else if (obj[column] === 1) obj[column] = true;
	}
	return obj;
};
