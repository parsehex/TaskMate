import { AsyncDatabase } from 'promised-sqlite3';
import path from 'path';
import fs from 'fs-extra';
import { updateSchema } from './schema/index.js';

export let db: AsyncDatabase;

export const initializeDatabase = async () => {
	db = await AsyncDatabase.open('database.sqlite3');
	await updateSchema(db);
};

export const backupDatabase = async () => {
	const backupDir = path.join(process.cwd(), 'backups');
	const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
	const backupFilename = `database-backup-${timestamp}.sqlite3`;
	const backupPath = path.join(backupDir, backupFilename);

	await fs.ensureDir(backupDir);
	await fs.copy('database.sqlite3', backupPath);
	console.log(`Database backup created: ${backupPath}`);
};
