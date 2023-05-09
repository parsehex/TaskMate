import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanChatMessage, SystemChatMessage } from 'langchain/schema';
import { db } from './db/index.js';

const chat = new ChatOpenAI({
	openAIApiKey: process.env.OPENAI_API_KEY as string,
	modelName: 'gpt-3.5-turbo',
	temperature: 0.3,
});

export const summarize = async (promptPart: any) => {
	let prompt = `Summarize the following block of text in a succinct but information-dense way.`;
	if (promptPart.part_type === 'file') {
		const project: any = await db.get(
			'SELECT name FROM projects WHERE id = ?',
			[promptPart.project_id]
		);
		const projectName = project.name;
		prompt = `Summarize the following file succinctly but thoroughly. Your summary should detail all exports: functions or methods, variables, types, interfaces, enums, objects, React components, middleware functions, routes, or any other exported entities. Describe their purpose, their parameters (if applicable), their return types (if applicable), and their primary use cases. Include any helper functions or methods and their functionalities. If relevant, mention any classes, interfaces, or data structures that need to be imported from other files to utilize these exports. Focus on providing a practical guide for developers who will use this file, while keeping the summary as compact as possible.`;
	}
	const text = promptPart.use_summary ? promptPart.summary : promptPart.content;
	const response = await chat.call([
		new HumanChatMessage(prompt + '\n\n' + promptPart.name + text),
	]);
	return response;
};
