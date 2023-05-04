import { AsyncDatabase } from 'promised-sqlite3';

export async function update(db: AsyncDatabase) {
	await db.run(`
    ALTER TABLE prompt_parts
    ADD COLUMN use_summary BOOLEAN DEFAULT 0
  `);
}
