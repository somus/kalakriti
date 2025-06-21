CREATE TYPE "public"."gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TABLE "event_participants" (
	"id" varchar PRIMARY KEY NOT NULL,
	"event_id" varchar NOT NULL,
	"participant_id" varchar NOT NULL,
	"attended" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"dob" date NOT NULL,
	"age" integer NOT NULL,
	"gender" "gender" NOT NULL,
	"center_id" varchar NOT NULL,
	"participant_category_id" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_center_id_centers_id_fk" FOREIGN KEY ("center_id") REFERENCES "public"."centers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_participant_category_id_participant_categories_id_fk" FOREIGN KEY ("participant_category_id") REFERENCES "public"."participant_categories"("id") ON DELETE no action ON UPDATE no action;