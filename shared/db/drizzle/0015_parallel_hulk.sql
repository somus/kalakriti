CREATE TABLE "sub_event_participants" (
	"id" varchar PRIMARY KEY NOT NULL,
	"sub_event_id" varchar NOT NULL,
	"participant_id" varchar NOT NULL,
	"attended" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sub_events" (
	"id" varchar PRIMARY KEY NOT NULL,
	"participant_category_id" varchar NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"event_id" varchar NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_participants" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "event_participants" CASCADE;--> statement-breakpoint
ALTER TABLE "centers" ALTER COLUMN "phone_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "coordinator_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "event_category_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sub_event_participants" ADD CONSTRAINT "sub_event_participants_sub_event_id_sub_events_id_fk" FOREIGN KEY ("sub_event_id") REFERENCES "public"."sub_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_event_participants" ADD CONSTRAINT "sub_event_participants_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_events" ADD CONSTRAINT "sub_events_participant_category_id_participant_categories_id_fk" FOREIGN KEY ("participant_category_id") REFERENCES "public"."participant_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_events" ADD CONSTRAINT "sub_events_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "start_time";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "end_time";