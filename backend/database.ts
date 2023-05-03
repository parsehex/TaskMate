import { AsyncDatabase } from 'promised-sqlite3';
import { createProjectsTable, createPromptPartsTable } from './schema';

export let db: AsyncDatabase;

export const initializeDatabase = async () => {
	db = await AsyncDatabase.open('database.sqlite3');
	await db.run(createProjectsTable);
	await db.run(createPromptPartsTable);
};
