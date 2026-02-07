import type { Project } from '@taskmate/core/types';

console.log("TaskMate v2 Local Mode");

// Stub for CLI argument parsing
const args = process.argv.slice(2);
const command = args[0] || 'help';

async function main() {
	switch (command) {
		case 'init':
			console.log("Initializing new project...");
			const project: Project = {
				id: 'local-1',
				name: 'Local Project',
				sources: [],
				options: { includeProjectFiles: true }
			};
			console.log(`Created project structure for: ${project.name}`);
			break;
		case 'serve':
			console.log("Starting local server on port 3000...");
			// TODO: Express server logic here
			break;
		default:
			console.log("Available commands: init, serve");
	}
}

main().catch(console.error);
