Initial Goal:
I want the page divided up so that the lefthand 1/3rd makes a sidebar.
At the top of the sidebar is a dropdown to select a project. This dropdown should be the list of project folders. Selecting a different project will load that project's prompt parts.
The list of prompt parts takes up the rest of the sidebar.
Each Prompt Part should be shown in the list. Each one should have: 1) A checkbox that represents the `included` column, 2) The part's name, 3) If part_type is a file, display an F on the right side of the part item. Prompt Parts can be clicked on to select the part to begin editing its content on the righthand 2/3rds of the page.

Currently:
We need a button to add a new prompt part (a snippet). Also, in the prompt parts route, lets add the file content for each prompt part that is a 'file' part_type to the response for the client to use. When we update a prompt part, if it's a file then we should write the new content to the file, assuming content is provided to change.
Also lets start making the editor functional.

App.tsx:
import \* as React from 'react';
import { useState, useEffect } from 'react';

interface Project {
id: number;
name: string;
description: string;
ignore_files: string;
created_at: string;
}

interface Prompt_Part {
id: number;
project_id: number;
content: string;
name: string;
snippet: boolean;
part_type: 'file' | 'snippet';
included: boolean;
position: number;
created_at: string;
updated_at: string;
}

export const App: React.FC = () => {
const [projects, setProjects] = useState<Project[]>([]);
const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
null
);
const [promptParts, setPromptParts] = useState<Prompt_Part[]>([]);
const [selectedPromptPart, setSelectedPromptPart] =
useState<Prompt_Part | null>(null);

    useEffect(() => {
    	// Fetch projects here and update the 'projects' state
    	const fetchProjects = async () => {
    		const response = await fetch('/api/projects');
    		const data = await response.json();
    		setProjects(data);
    	};
    	fetchProjects();
    }, []);

    useEffect(() => {
    	if (selectedProjectId) {
    		// Fetch prompt parts for the selected project and update the 'promptParts' state
    		const fetchPromptParts = async () => {
    			const response = await fetch(`/api/prompt_parts/${selectedProjectId}`);
    			const data = await response.json();
    			setPromptParts(data);
    		};
    		fetchPromptParts();
    	}
    }, [selectedProjectId]);

    const handleProjectSelection = (
    	event: React.ChangeEvent<HTMLSelectElement>
    ) => {
    	setSelectedProjectId(Number(event.target.value));
    };

    const handlePromptPartClick = (promptPart: Prompt_Part) => {
    	setSelectedPromptPart(promptPart);
    };

    return (
    	<div className="app">
    		<div className="sidebar">
    			<select
    				className="project-selector"
    				value={selectedProjectId || ''}
    				onChange={handleProjectSelection}
    			>
    				<option value="">Select a project</option>
    				{projects.map((project) => (
    					<option key={project.id} value={project.id}>
    						{project.name}
    					</option>
    				))}
    			</select>
    			<ul id="prompt-parts">
    				{promptParts.map((promptPart) => (
    					<li
    						key={promptPart.id}
    						onClick={() => handlePromptPartClick(promptPart)}
    					>
    						<input
    							type="checkbox"
    							checked={promptPart.included}
    							// Add logic to handle checkbox changes
    						/>
    						<span className="prompt-part-name">{promptPart.name}</span>
    						{promptPart.part_type === 'file' && (
    							<span className="file-indicator">File</span>
    						)}
    					</li>
    				))}
    			</ul>
    		</div>
    		<div className="editor">
    			{selectedPromptPart && (
    				<div>
    					<h2>Editing: {selectedPromptPart.name}</h2>
    					{/* Add your editor component here and pass the content of the selectedPromptPart */}
    				</div>
    			)}
    		</div>
    	</div>
    );

};

schema.ts:
export const createProjectsTable = `CREATE TABLE IF NOT EXISTS projects (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name VARCHAR(255) UNIQUE NOT NULL,
	description TEXT,
	ignore_files TEXT,
	created_at TIMESTAMP
);`;

export const createPromptPartsTable = `CREATE TABLE IF NOT EXISTS prompt_parts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	project_id INTEGER,
	name VARCHAR(255), -- If file part_type, this is a relative path to the file including extension. Snippets don't have extensions (but can I guess).
	content TEXT,
	included BOOLEAN DEFAULT 1,
	part_type VARCHAR(255), -- 'file' or 'snippet'
	position INTEGER,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	FOREIGN KEY (project_id) REFERENCES projects (id),
	UNIQUE (project_id, name)
);`;

routes/prompt_parts.ts:
import express from 'express';
import { db } from '../database';
import {
insertStatement,
updateStatement,
deleteStatement,
} from '../sql-utils';

const router = express.Router();

// Get all prompt parts
router.get('/api/prompt_parts', async (req, res) => {
try {
const promptParts = await db.all('SELECT \* FROM prompt_parts');
res.status(200).json(promptParts);
} catch (err: any) {
res.status(500).json({ error: err.message });
}
});

// Create new prompt part
router.post('/api/prompt_parts', async (req, res) => {
const { name, project_id, part_type } = req.body;

    if (!name || !project_id || !part_type) {
    	return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
    	const existingPromptParts = await db.all(
    		'SELECT * FROM prompt_parts WHERE project_id = ?',
    		[project_id]
    	);
    	const position = existingPromptParts.length + 1;

    	const { sql, values } = insertStatement('prompt_parts', {
    		name,
    		project_id,
    		part_type,
    		position,
    	});

    	const q = await db.run(sql, values);
    	const promptPart = await db.get('SELECT * FROM prompt_parts WHERE id = ?', [
    		q.lastID,
    	]);
    	res
    		.status(201)
    		.json({ message: 'Prompt part created successfully', promptPart });
    } catch (err: any) {
    	res.status(500).json({ error: err.message });
    }

});

// Update prompt part
router.put('/api/prompt_parts/:id', async (req, res) => {
const { id } = req.params;
const { name, content, position, included } = req.body;

    if (!name && !content && !position && included === undefined) {
    	return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
    	const { sql, values } = updateStatement(
    		'prompt_parts',
    		{ name, content, position, included },
    		{ id }
    	);

    	const q = await db.run(sql, ...values);
    	if (q.changes === 0) {
    		return res.status(404).json({ error: 'Prompt part not found' });
    	}
    	res.status(200).json({ message: 'Prompt part updated successfully' });
    } catch (err: any) {
    	res.status(500).json({ error: err.message });
    }

});

// Delete prompt part
router.delete('/api/prompt_parts/:id', async (req, res) => {
const { id } = req.params;

    try {
    	const sql = deleteStatement('prompt_parts', { id });
    	const q = await db.run(sql);
    	if (q.changes === 0) {
    		return res.status(404).json({ error: 'Prompt part not found' });
    	}
    	res.status(200).json({ message: 'Prompt part deleted successfully' });
    } catch (err: any) {
    	res.status(500).json({ error: err.message });
    }

});

export default router;
