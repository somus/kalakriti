CREATE TYPE "public"."allowed_event_gender" AS ENUM('male', 'female', 'both');--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "allowed_gender" "allowed_event_gender" DEFAULT 'both' NOT NULL;