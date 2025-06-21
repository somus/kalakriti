ALTER TABLE "centers" DROP CONSTRAINT "centers_liason_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "centers" DROP CONSTRAINT "centers_guardian_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "centers" DROP COLUMN "liason_id";--> statement-breakpoint
ALTER TABLE "centers" DROP COLUMN "guardian_id";