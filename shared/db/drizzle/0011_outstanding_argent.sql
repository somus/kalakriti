CREATE TABLE "event_categories" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"coordinator_id" varchar
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "event_category_id" varchar;--> statement-breakpoint
ALTER TABLE "event_categories" ADD CONSTRAINT "event_categories_coordinator_id_users_id_fk" FOREIGN KEY ("coordinator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_event_category_id_event_categories_id_fk" FOREIGN KEY ("event_category_id") REFERENCES "public"."event_categories"("id") ON DELETE no action ON UPDATE no action;