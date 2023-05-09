import { ChatGPTAPI } from 'chatgpt';
import { db } from './db/index.js';

const api = new ChatGPTAPI({
	apiKey: process.env.OPENAI_API_KEY as string,
});

export const summarize = async (promptPart: any) => {
	let prompt = `Summarize the following block of text in a succinct but information-rich way.`;
	if (promptPart.part_type === 'file') {
		const project: any = await db.get(
			'SELECT name FROM projects WHERE id = ?',
			[promptPart.project_id]
		);
		const projectName = project.name;
		prompt = `Summarize the following file from the ${projectName} project in a succinct but information-rich way. Include information that other files in the project need to know.`;
	}
	const text = promptPart.use_summary ? promptPart.summary : promptPart.content;
	const response = await api.sendMessage(
		prompt + '\n\n' + promptPart.name + text
	);
	return response;
};
