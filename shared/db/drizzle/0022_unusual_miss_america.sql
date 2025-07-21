ALTER TABLE "events" ALTER COLUMN "max_participants" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "is_group_event" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "min_group_size" integer;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "max_group_size" integer;--> statement-breakpoint
ALTER TABLE "sub_event_participants" ADD COLUMN "group_id" varchar;--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "min_participants";