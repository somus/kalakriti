CREATE TABLE "inventory_events" (
	"inventory_id" varchar NOT NULL,
	"event_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_events_inventory_id_event_id_pk" PRIMARY KEY("inventory_id","event_id")
);
--> statement-breakpoint
CREATE TABLE "inventory_transaction_events" (
	"inventory_transaction_id" varchar NOT NULL,
	"event_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_transaction_events_inventory_transaction_id_event_id_pk" PRIMARY KEY("inventory_transaction_id","event_id")
);
--> statement-breakpoint
ALTER TABLE "inventory_events" ADD CONSTRAINT "inventory_events_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_events" ADD CONSTRAINT "inventory_events_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transaction_events" ADD CONSTRAINT "inventory_transaction_events_inventory_transaction_id_inventory_transactions_id_fk" FOREIGN KEY ("inventory_transaction_id") REFERENCES "public"."inventory_transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_transaction_events" ADD CONSTRAINT "inventory_transaction_events_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;