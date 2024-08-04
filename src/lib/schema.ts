import { doublePrecision, pgSchema, pgTable, text } from 'drizzle-orm/pg-core';

export const schema = pgSchema('cinderella');

export const songTable = pgTable('song', {
	id: text('id').primaryKey(),
	tempo: doublePrecision('tempo').notNull()
});
