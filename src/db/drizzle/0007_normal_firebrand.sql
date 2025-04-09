CREATE TABLE "center_guardians" (
	"user_id" varchar NOT NULL,
	"center_id" varchar NOT NULL,
	CONSTRAINT "center_guardians_user_id_center_id_pk" PRIMARY KEY("user_id","center_id")
);
--> statement-breakpoint
CREATE TABLE "center_liasons" (
	"user_id" varchar NOT NULL,
	"center_id" varchar NOT NULL,
	CONSTRAINT "center_liasons_user_id_center_id_pk" PRIMARY KEY("user_id","center_id")
);
--> statement-breakpoint
ALTER TABLE "center_guardians" ADD CONSTRAINT "center_guardians_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "center_guardians" ADD CONSTRAINT "center_guardians_center_id_centers_id_fk" FOREIGN KEY ("center_id") REFERENCES "public"."centers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "center_liasons" ADD CONSTRAINT "center_liasons_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "center_liasons" ADD CONSTRAINT "center_liasons_center_id_centers_id_fk" FOREIGN KEY ("center_id") REFERENCES "public"."centers"("id") ON DELETE no action ON UPDATE no action;