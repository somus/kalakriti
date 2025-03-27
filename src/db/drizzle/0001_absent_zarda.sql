CREATE TYPE "public"."roles" AS ENUM('guardian', 'admin', 'volunteer');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "roles" DEFAULT 'volunteer';