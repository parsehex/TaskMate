import axios, { AxiosResponse } from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';

const HOST = 'localhost:5000';
const URI = `http://${HOST}/api/v1/generate`;

class TextGenerator {
	private static defaultParams: object;

	private params: object;

	constructor(customParams?: object) {
		if (!TextGenerator.defaultParams) {
			// Load default settings from the settings.json file
			try {
				TextGenerator.defaultParams = fs.readJsonSync(
					path.join(__dirname, 'settings.json')
				);
			} catch (error) {
				console.error('Error reading settings.json:', error);
				TextGenerator.defaultParams = {
					//... all other default parameters if settings.json is not found or has an error
					stopping_strings: [],
				};
			}
		}

		this.params = { ...TextGenerator.defaultParams, ...customParams };
		console.log('Using parameters:', this.params);
	}

	async generateTextFromFile(filePath: string): Promise<string | undefined> {
		let inputFile: string;
		try {
			inputFile = await fs.readFile(filePath, 'utf-8');
		} catch (err) {
			console.error('Failed to read the input file.', err);
			return;
		}

		// if the file begins with a path followed by a colon, extract it and remove it
		// and use it as the prompt
		const firstLine = inputFile.split('\n')[0];
		const colonIndex = firstLine.indexOf(':');
		let fileName = '';
		if (colonIndex > 0) {
			fileName = 'File: ' + firstLine.substring(0, colonIndex) + '\n';
			inputFile = inputFile.substring(colonIndex + 1);
		}

		const prompt1 = `[INST] Provide a short and concise, one-line description of the following file to provide a high-level understanding of its purpose. End your description with [END] on a new line.
${fileName}\`\`\`
${inputFile}
\`\`\`
[/INST]
`;
		const prompt2 = `[INST] Provide a more concise, one-line description of a file based on the following summary.
\`\`\`
This file imports necessary dependencies and sets up the application by initializing the websocket connection, creating a root element for rendering components using react-dom/client, and then renders an instance of the \`App\` component wrapped in a DnD provider with HTML5Backend.
\`\`\`
[/INST]`;

		const prompt3 = `[INST] Summarize the following file in 4-10 words to explain its purpose.
Example concise descriptions:
"Imports dependencies and sets up the application"
"Renders the App component"
"Renders the App component wrapped in a DnD provider with HTML5Backend"
${fileName}\`\`\`
${inputFile}
\`\`\`
[/INST]`;

		const response = await this.generate(prompt3);
		console.log('Generated text:', response);
		return response;
	}

	private async generate(prompt: string): Promise<string | undefined> {
		try {
			const response: AxiosResponse = await axios.post(URI, {
				...this.params,
				prompt: prompt,
			});

			if (response.status === 200) {
				return response.data['results'][0]['text'];
			} else {
				console.error(response.status, response.data);
				return;
			}
		} catch (err) {
			console.error('Error generating text.', err);
			return;
		}
	}
}

// Ideas:
// - If a file is short, adjust prompt to use a few words

(async () => {
	const generator = new TextGenerator({
		max_new_tokens: 50,
		stopping_strings: ['[END]'],
		top_p: 0.9,
	});
	const summary = await generator.generateTextFromFile(
		path.join(__dirname, 'input.txt')
	);
	if (summary) {
		console.log(summary);
	}
})();
