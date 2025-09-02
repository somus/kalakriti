ALTER TABLE "inventory" DROP CONSTRAINT "inventory_event_id_events_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP CONSTRAINT "inventory_transactions_event_id_events_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory" DROP COLUMN "event_id";--> statement-breakpoint
ALTER TABLE "inventory_transactions" DROP COLUMN "event_id";