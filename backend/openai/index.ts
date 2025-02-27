import path from 'path';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanChatMessage, SystemChatMessage } from 'langchain/schema';
import { Prompt_Part, isFile } from '../../shared/types/index.js';
import { getProjectById } from '../db/helper/projects.js';
import { getSummarizePrompt } from './prompts.js';

let chat: ChatOpenAI;

export function initOpenAI() {
	if (process.env.OPENAI_API_KEY) {
		chat = new ChatOpenAI({
			openAIApiKey: process.env.OPENAI_API_KEY as string,
			modelName: 'gpt-3.5-turbo',
			temperature: 0.5,
			maxTokens: 750,
			topP: 0.5,
			frequencyPenalty: 0.85,
			presencePenalty: 0.5,
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
	if (!chat) {
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
	const response = await chat.call([
		new HumanChatMessage(
			prompt + '\n\n' + name + (isSummary ? ' (summary)' : '') + ':' + content
		),
	]);
	console.log(response);
	return response;
};

import OpenAI from 'openai';

export const generateResponse = async (prompt: string) => {
	const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
	const response = await openai.chat.completions.create({
		model: 'gpt-4-turbo',
		messages: [{ role: 'user', content: prompt }],
	});
	return response.choices[0]?.message?.content;
};
