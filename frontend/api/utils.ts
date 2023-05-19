import UtilsHandlers from '../ws/utils';

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
	if (Object.keys(options).every((key) => options[key] === undefined)) {
		return { token_count: 0 };
	} else {
		const token_count = await UtilsHandlers.GET_TOKEN_COUNT(options);
		return { token_count };
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
	if (fileId !== undefined || snippetId !== undefined) {
		const data = await UtilsHandlers.GENERATE_SUMMARY(options);
		return { data: { text: data } };
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
