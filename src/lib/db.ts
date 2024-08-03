import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';

const client = new Client({
	connectionString:
		'postgres://postgres:Z5CcnoUEo3LJ9AkMIhSMJ55NmSpNl9GLnPUog51tTUwTyq8yCUYPM9aJ4Nwv9ghr@37.27.198.56:5432/postgres'
});

await client.connect();
export const db = drizzle(client);
