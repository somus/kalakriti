CREATE TABLE "centers" (
	"id" varchar PRIMARY KEY NOT NULL,
	"first_name" varchar NOT NULL,
	"phone_number" varchar,
	"email" varchar NOT NULL,
	"liason_id" varchar,
	"guardian_id" varchar
);
--> statement-breakpoint
ALTER TABLE "centers" ADD CONSTRAINT "centers_liason_id_users_id_fk" FOREIGN KEY ("liason_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "centers" ADD CONSTRAINT "centers_guardian_id_users_id_fk" FOREIGN KEY ("guardian_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;