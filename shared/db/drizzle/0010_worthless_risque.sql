ALTER TABLE "center_liasons" RENAME TO "center_liaisons";--> statement-breakpoint
ALTER TABLE "center_liaisons" DROP CONSTRAINT "center_liasons_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "center_liaisons" DROP CONSTRAINT "center_liasons_center_id_centers_id_fk";
--> statement-breakpoint
ALTER TABLE "center_liaisons" DROP CONSTRAINT "center_liasons_user_id_center_id_pk";--> statement-breakpoint
ALTER TABLE "center_liaisons" ADD CONSTRAINT "center_liaisons_user_id_center_id_pk" PRIMARY KEY("user_id","center_id");--> statement-breakpoint
ALTER TABLE "center_liaisons" ADD CONSTRAINT "center_liaisons_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "center_liaisons" ADD CONSTRAINT "center_liaisons_center_id_centers_id_fk" FOREIGN KEY ("center_id") REFERENCES "public"."centers"("id") ON DELETE no action ON UPDATE no action;