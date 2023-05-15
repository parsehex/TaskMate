import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanChatMessage, SystemChatMessage } from 'langchain/schema';
import { Prompt_Part, isFile } from '../types/index.js';
import { getProjectById } from './db/helper/projects.js';
import path from 'path';

const chat = new ChatOpenAI({
	openAIApiKey: process.env.OPENAI_API_KEY as string,
	modelName: 'gpt-3.5-turbo',
	temperature: 0.5,
	maxTokens: 750,
	topP: 0.5,
	frequencyPenalty: 0.85,
	presencePenalty: 0.5,
});

const getPromptByFileType = (fileName: string, fileExtension: string) => {
	switch (fileExtension) {
		case '.sql':
			if (fileName.toLowerCase().includes('schema')) {
				return 'Summarize this SQL schema file concisely but thoroughly, including details about tables, columns, and their data types.';
			} else {
				return 'Summarize this SQL file concisely but thoroughly, including details about the operations performed.';
			}
		case '.js':
		case '.mjs':
		case '.ts':
		case '.mts':
			return 'Summarize this JavaScript/TypeScript file concisely but thoroughly, including details about all exports, their purpose, and any important implementation details.';
		case '.jsx':
		case '.tsx':
			return 'Summarize this JSX/TSX file concisely but thoroughly, describing exported React/Vue components, their props, state (if applicable), and a brief summary of what they render.';
		case '.json':
			return 'Summarize this JSON file concisely but thoroughly, describing the structure of the data, the meaning of each key, and the type and general contents of the associated values.';
		case '.scss':
			return 'Summarize this SCSS file concisely but thoroughly, describing key style classes, their properties, nested structures, mixins used, and any styles affecting a large part of the application.';
		case '.html':
			return 'Summarize this HTML file concisely but thoroughly, outlining the main sections of the webpage, their structure, and any significant elements such as forms or tables.';
		default:
			return 'Summarize this file concisely but thoroughly, including any pertinent information based on the file type.';
	}
};

export const summarize = async (promptPart: Prompt_Part) => {
	let prompt =
		'Summarize the following block of text in a succinct but information-dense way.';
	if (isFile(promptPart)) {
		const project = await getProjectById(promptPart.project_id, 'name');
		const projectName = project.name;
		const fileExtension = path.extname(promptPart.name);
		prompt = getPromptByFileType(promptPart.name, fileExtension);
	}
	const text = promptPart.use_summary ? promptPart.summary : promptPart.content;
	const response = await chat.call([
		new HumanChatMessage(prompt + '\n\n' + promptPart.name + ':' + text),
	]);
	console.log(response);
	return response;
};
