ALTER TABLE "events" ADD COLUMN "start_time" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "end_time" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone_number" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email" varchar;