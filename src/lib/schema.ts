import { decimal, pgSchema, pgTable, text } from 'drizzle-orm/pg-core';

export const schema = pgSchema('cinderella');

export const song = pgTable('song', {
	id: text('id').primaryKey(),
	tempo: decimal('tempo')
});
