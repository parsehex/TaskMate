import { AsyncDatabase } from 'promised-sqlite3';

export async function update(db: AsyncDatabase) {
	await db.run(`
		CREATE TABLE IF NOT EXISTS snippets (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			project_id INTEGER,
			name VARCHAR(255),
			content TEXT DEFAULT '',
			summary TEXT DEFAULT '',
			included BOOLEAN DEFAULT 1,
			use_title BOOLEAN DEFAULT 1,
			use_summary BOOLEAN DEFAULT 0,
			type VARCHAR(25),
			position INTEGER,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (project_id) REFERENCES projects (id),
			UNIQUE (project_id, name)
		);
	`);

	await db.run(`
		CREATE TABLE IF NOT EXISTS files (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			project_id INTEGER,
			name VARCHAR(255),
			summary TEXT DEFAULT '',
			included BOOLEAN DEFAULT 1,
			use_title BOOLEAN DEFAULT 1,
			use_summary BOOLEAN DEFAULT 0,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (project_id) REFERENCES projects (id),
			UNIQUE (project_id, name)
		);
	`);

	await db.run(`
		INSERT INTO snippets (id, project_id, name, content, summary, included, use_title, use_summary, type, position, created_at, updated_at)
		SELECT id, project_id, name, content, summary, included, use_title, use_summary, part_type, position, created_at, updated_at
		FROM prompt_parts
		WHERE part_type = 'snippet';
	`);

	await db.run(`
		INSERT INTO files (id, project_id, name, summary, included, use_title, use_summary, created_at, updated_at)
		SELECT id, project_id, name, summary, included, use_title, use_summary, created_at, updated_at
		FROM prompt_parts
		WHERE part_type = 'file';
	`);

	await db.run(`
		DROP TABLE prompt_parts;
	`);
}
