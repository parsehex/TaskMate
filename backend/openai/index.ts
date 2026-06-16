import path from 'path';
import OpenAI from 'openai';
import { Prompt_Part, isFile } from '../../shared/types/index.js';
import { getProjectById } from '../db/helper/projects.js';
import { getSummarizePrompt } from './prompts.js';

let openaiClient: OpenAI;

export function initOpenAI() {
	if (process.env.OPENAI_API_KEY) {
		openaiClient = new OpenAI({
			apiKey: process.env.OPENAI_API_KEY as string,
		});
	} else {
		console.log('No OpenAI API key found');
	}
}

export const summarize = async (
	name: string,
	content: string,
	isSummary = false
) => {
	if (!openaiClient) {
		console.warn(
			'Tried to summarize but server not started with an OpenAI key'
		);
		return;
	}
	let prompt =
		'Summarize the following block of text in a succinct but information-dense way.';
	if (name.includes('.')) {
		const fileExtension = path.extname(name);
		prompt = getSummarizePrompt(name, fileExtension);
	}
	const response = await openaiClient.chat.completions.create({
		model: 'gpt-3.5-turbo',
		temperature: 0.5,
		max_tokens: 750,
		top_p: 0.5,
		frequency_penalty: 0.85,
		presence_penalty: 0.5,
		messages: [
			{
				role: 'user',
				content: prompt + '\n\n' + name + (isSummary ? ' (summary)' : '') + ':' + content,
			},
		],
	});
	console.log(response);
	return response;
};

export const generateResponse = async (prompt: string) => {
	if (!openaiClient) {
		console.warn(
			'Tried to generate response but server not started with an OpenAI key'
		);
		return;
	}
	const response = await openaiClient.chat.completions.create({
		model: 'gpt-4-turbo',
		messages: [{ role: 'user', content: prompt }],
	});
	return response.choices[0]?.message?.content;
};
