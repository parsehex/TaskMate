-- Projects
CREATE TABLE IF NOT EXISTS projects (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name VARCHAR(255) UNIQUE NOT NULL,
	description TEXT,
	ignore_files TEXT,
	created_at TIMESTAMP
);

-- Prompt Parts
CREATE TABLE IF NOT EXISTS prompt_parts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	project_id INTEGER,
	name VARCHAR(255),
	content TEXT DEFAULT '',
	summary TEXT DEFAULT '',
	included BOOLEAN DEFAULT 1,
	use_title BOOLEAN DEFAULT 1,
	use_summary BOOLEAN DEFAULT 0,
	part_type VARCHAR(25), -- 'file' or 'snippet'
	position INTEGER,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	FOREIGN KEY (project_id) REFERENCES projects (id),
	UNIQUE (project_id, name)
);

-- Schema versions
CREATE TABLE IF NOT EXISTS schema_versions (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	version INTEGER UNIQUE NOT NULL,
	applied_at TIMESTAMP
);
