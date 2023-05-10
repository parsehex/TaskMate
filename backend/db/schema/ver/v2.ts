import { AsyncDatabase } from 'promised-sqlite3';

export async function update(db: AsyncDatabase) {
	await db.run(`
    ALTER TABLE prompt_parts
    ADD COLUMN use_title BOOLEAN DEFAULT 1
  `);
}
