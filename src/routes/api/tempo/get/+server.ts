import { db } from '$lib/db';
import { songTable } from '$lib/schema';
import type { RequestHandler } from '@sveltejs/kit';
import { inArray } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	const ids: string[] = await request.json();

	const tempos = await db.select().from(songTable).where(inArray(songTable.id, ids));
	return new Response(JSON.stringify(tempos));
};
