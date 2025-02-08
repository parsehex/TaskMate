import { AsyncDatabase } from 'promised-sqlite3';
import path from 'path';
import fs from 'fs-extra';
import { updateSchema } from './schema/index.js';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const dbPath = path.join(
	process.env.PROJECTS_ROOT || `${__dirname}/..`,
	'query-craft_db.sqlite3'
);

export let db: AsyncDatabase;

export const initializeDatabase = async () => {
	db = await AsyncDatabase.open(dbPath);
	await updateSchema(db);
};

export const backupDatabase = async () => {
	const base = path.dirname(dbPath);
	const backupDir = path.join(base, 'backups');
	const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
	const backupFilename = `db-backup-${timestamp}.sqlite3`;
	const backupPath = path.join(backupDir, backupFilename);

	await fs.ensureDir(backupDir);
	await fs.copy(dbPath, backupPath);
	console.log(`Database backup created: ${backupPath}`);
};
