CREATE TABLE "participant_categories" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"min_age" integer NOT NULL,
	"max_age" integer NOT NULL,
	"max_boys" integer NOT NULL,
	"max_girls" integer NOT NULL,
	"total_events_allowed" integer NOT NULL,
	"max_events_per_category" integer NOT NULL
);
