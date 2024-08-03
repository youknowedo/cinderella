import { defineConfig } from 'drizzle-kit';
export default defineConfig({
	dbCredentials: {
		url: 'postgres://postgres:Z5CcnoUEo3LJ9AkMIhSMJ55NmSpNl9GLnPUog51tTUwTyq8yCUYPM9aJ4Nwv9ghr@37.27.198.56:5432/postgres'
	},
	dialect: 'postgresql',
	schema: './src/lib/schema.ts',
	out: './drizzle'
});
