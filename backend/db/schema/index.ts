import fs from 'fs-extra';
import path from 'path';
import { AsyncDatabase } from 'promised-sqlite3';
import { backupDatabase } from '../index.js';
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const MIGRATIONS_DIR = path.join(__dirname, 'ver');

async function applyMigration(db: AsyncDatabase, version: number) {
	const migrationFile = path.join(MIGRATIONS_DIR, `v${version}.js`); // js when compiled

	if (await fs.pathExists(migrationFile)) {
		const migration = await import(migrationFile);
		await migration.update(db);
		return true;
	}

	return false;
}

export async function updateSchema(db: AsyncDatabase) {
	const schemaFile = path.join(process.cwd(), 'schema.sql');
	const schemaContent = await fs.readFile(schemaFile, 'utf-8');
	await db.exec(schemaContent);

	// Get the current schema version
	const currentVersionResult: any = await db.get(
		'SELECT MAX(version) as version FROM schema_versions'
	);
	const currentVersion = currentVersionResult?.version || 0;

	console.log(`Current schema version: v${currentVersion}`);

	// get latest version and backup if we're going to migrate
	const versions = (await fs.readdir(MIGRATIONS_DIR))
		.map((v: string) => parseInt(v.split('v')[1].split('.')[0]))
		.sort((a, b) => b - a);
	const latestVersion = versions[0];
	if (latestVersion > currentVersion) {
		await backupDatabase();
	}

	// Apply migrations
	for (let version = currentVersion + 1; ; version++) {
		console.log(`Applying schema update: v${version}`);
		const applied = await applyMigration(db, version);

		if (!applied) {
			break;
		}

		await db.run(
			'INSERT INTO schema_versions (version, applied_at) VALUES (?, ?)',
			[version, new Date()]
		);
		console.log(`Applied schema update: v${version}`);
	}
}
