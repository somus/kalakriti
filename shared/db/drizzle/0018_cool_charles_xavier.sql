CREATE TABLE "event_coordinators" (
	"user_id" varchar NOT NULL,
	"event_id" varchar NOT NULL,
	CONSTRAINT "event_coordinators_user_id_event_id_pk" PRIMARY KEY("user_id","event_id")
);
--> statement-breakpoint
CREATE TABLE "event_volunteers" (
	"user_id" varchar NOT NULL,
	"event_id" varchar NOT NULL,
	CONSTRAINT "event_volunteers_user_id_event_id_pk" PRIMARY KEY("user_id","event_id")
);
--> statement-breakpoint
ALTER TABLE "events" DROP CONSTRAINT "events_coordinator_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "event_coordinators" ADD CONSTRAINT "event_coordinators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_coordinators" ADD CONSTRAINT "event_coordinators_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_volunteers" ADD CONSTRAINT "event_volunteers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_volunteers" ADD CONSTRAINT "event_volunteers_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "coordinator_id";