import { AsyncDatabase } from 'promised-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export async function update(db: AsyncDatabase) {
	await db.exec(`PRAGMA foreign_keys = OFF;`); // Disable foreign keys temporarily

	// Create new tables with TEXT primary keys
	await db.run(`
		CREATE TABLE projects_new (
			id TEXT PRIMARY KEY,
			name VARCHAR(255) UNIQUE NOT NULL,
			description TEXT DEFAULT '',
			ignore_files TEXT DEFAULT '[]',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`);

	await db.run(`
		CREATE TABLE snippets_new (
			id TEXT PRIMARY KEY,
			project_id TEXT,
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
			FOREIGN KEY (project_id) REFERENCES projects_new (id),
			UNIQUE (project_id, name)
		);
	`);

	await db.run(`
		CREATE TABLE files_new (
			id TEXT PRIMARY KEY,
			project_id TEXT,
			name VARCHAR(255),
			summary TEXT DEFAULT '',
			included BOOLEAN DEFAULT 1,
			use_title BOOLEAN DEFAULT 1,
			use_summary BOOLEAN DEFAULT 0,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (project_id) REFERENCES projects_new (id),
			UNIQUE (project_id, name)
		);
	`);

	// Copy data from old tables while converting IDs to TEXT
	const rows = await db.all(`SELECT * FROM projects`) as any[];
	for (const row of rows) {
		await db.run(
			`INSERT INTO projects_new (id, name, description, ignore_files, created_at)
			VALUES (?, ?, ?, ?, ?)`,
			[row.id.toString(), row.name, row.description, row.ignore_files, row.created_at]
		);
	}

	const snippetRows = await db.all(`SELECT * FROM snippets`) as any[];
	for (const row of snippetRows) {
		await db.run(
			`INSERT INTO snippets_new (id, project_id, name, content, summary, included, use_title, use_summary, type, position, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[row.id.toString(), row.project_id?.toString(), row.name, row.content, row.summary, row.included, row.use_title, row.use_summary, row.type, row.position, row.created_at, row.updated_at]
		);
	}

	const fileRows = await db.all(`SELECT * FROM files`) as any[];
	for (const row of fileRows) {
		await db.run(
			`INSERT INTO files_new (id, project_id, name, summary, included, use_title, use_summary, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[row.id.toString(), row.project_id?.toString(), row.name, row.summary, row.included, row.use_title, row.use_summary, row.created_at, row.updated_at]
		);
	}

	// Drop old tables
	await db.run(`DROP TABLE snippets;`);
	await db.run(`DROP TABLE files;`);
	await db.run(`DROP TABLE projects;`);

	// Rename new tables
	await db.run(`ALTER TABLE snippets_new RENAME TO snippets;`);
	await db.run(`ALTER TABLE files_new RENAME TO files;`);
	await db.run(`ALTER TABLE projects_new RENAME TO projects;`);

	await db.exec(`PRAGMA foreign_keys = ON;`); // Re-enable foreign keys
}
