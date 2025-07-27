CREATE TYPE "public"."inventory_transaction_type" AS ENUM('initial_inventory ', 'purchase', 'adjustment', 'event_return', 'event_dispatch');--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" integer NOT NULL,
	"event_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_transactions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"inventory_id" varchar NOT NULL,
	"event_id" varchar,
	"type" "inventory_transaction_type" NOT NULL,
	"quantity" integer NOT NULL,
	"notes" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;