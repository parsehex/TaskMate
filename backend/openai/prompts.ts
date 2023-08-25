export function getSummarizePrompt(fileName: string, fileExtension: string) {
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
}
