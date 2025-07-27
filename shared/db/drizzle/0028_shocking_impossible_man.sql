ALTER TABLE "inventory_transactions" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."inventory_transaction_type";--> statement-breakpoint
CREATE TYPE "public"."inventory_transaction_type" AS ENUM('initial_inventory', 'purchase', 'adjustment', 'event_return', 'event_dispatch');--> statement-breakpoint
ALTER TABLE "inventory_transactions" ALTER COLUMN "type" SET DATA TYPE "public"."inventory_transaction_type" USING "type"::"public"."inventory_transaction_type";