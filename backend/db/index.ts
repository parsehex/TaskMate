import { AsyncDatabase } from 'promised-sqlite3';
import path from 'path';
import fs from 'fs-extra';
import { updateSchema } from './schema/index.js';
import sqlite from 'sqlite3';

async function getDbPath() {
	let base = process.cwd();
	if (process.env.IS_ELECTRON === 'true') {
		const { app } = await import('electron');
		base = app.getPath('userData');
	}
	return path.join(
		process.env.PROJECTS_ROOT || base, // TODO FIX will always start with CWD
		'query-crafter_db.sqlite3'
	);
}

export let db: AsyncDatabase;

export const initializeDatabase = async () => {
	const dbPath = await getDbPath();
	console.log('DB path:', dbPath);
	db = await AsyncDatabase.open(
		dbPath,
		sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE
	);
	await updateSchema(db);
};

export const backupDatabase = async () => {
	const dbPath = await getDbPath();
	const base = path.dirname(dbPath);
	const backupDir = path.join(base, 'backups');
	const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
	const backupFilename = `db-backup-${timestamp}.sqlite3`;
	const backupPath = path.join(backupDir, backupFilename);

	await fs.ensureDir(backupDir);
	await fs.copy(dbPath, backupPath);
	console.log(`Database backup created: ${backupPath}`);
};
