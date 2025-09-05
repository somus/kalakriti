ALTER TABLE "participants" ADD COLUMN "picked_up" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "reached_venue" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "left_venue" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "dropped_off" boolean DEFAULT false NOT NULL;