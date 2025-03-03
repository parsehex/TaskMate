import { AsyncDatabase } from 'promised-sqlite3';

export async function update(db: AsyncDatabase) {
	await db.run(`
		ALTER TABLE snippets
		ADD COLUMN token_count INTEGER
	`);
}
