import { db } from '$lib/db';
import { songTable } from '$lib/schema';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const songs: { id: string; tempo: number }[] = await request.json();

	await db.insert(songTable).values(songs).execute();

	return new Response();
};
