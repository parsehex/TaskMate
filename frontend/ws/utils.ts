import { call } from '.';
import {
	GenerateSummaryMessage,
	GetTokenCountMessage,
	UtilsMessageHandlers,
} from '@shared/types/ws';

async function GET_TOKEN_COUNT(payload: GetTokenCountMessage) {
	return (await call('GET_TOKEN_COUNT', [payload])) as number;
}
async function GENERATE_SUMMARY(payload: GenerateSummaryMessage) {
	return (await call('GENERATE_SUMMARY', [payload])) as string;
}

const UtilsHandlers: UtilsMessageHandlers = {
	GET_TOKEN_COUNT,
	GENERATE_SUMMARY,
};

export default UtilsHandlers;
