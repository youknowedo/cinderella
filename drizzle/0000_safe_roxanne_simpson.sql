CREATE SCHEMA "cinderella";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "song" (
	"id" text PRIMARY KEY NOT NULL,
	"tempo" numeric
);
