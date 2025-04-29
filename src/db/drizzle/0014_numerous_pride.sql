ALTER TABLE "center_guardians" DROP CONSTRAINT "center_guardians_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "center_guardians" DROP CONSTRAINT "center_guardians_center_id_centers_id_fk";
--> statement-breakpoint
ALTER TABLE "center_liaisons" DROP CONSTRAINT "center_liaisons_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "center_liaisons" DROP CONSTRAINT "center_liaisons_center_id_centers_id_fk";
--> statement-breakpoint
ALTER TABLE "event_categories" DROP CONSTRAINT "event_categories_coordinator_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "event_participants" DROP CONSTRAINT "event_participants_event_id_events_id_fk";
--> statement-breakpoint
ALTER TABLE "event_participants" DROP CONSTRAINT "event_participants_participant_id_participants_id_fk";
--> statement-breakpoint
ALTER TABLE "events" DROP CONSTRAINT "events_coordinator_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "events" DROP CONSTRAINT "events_event_category_id_event_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "participants" DROP CONSTRAINT "participants_center_id_centers_id_fk";
--> statement-breakpoint
ALTER TABLE "participants" DROP CONSTRAINT "participants_participant_category_id_participant_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "center_guardians" ADD CONSTRAINT "center_guardians_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "center_guardians" ADD CONSTRAINT "center_guardians_center_id_centers_id_fk" FOREIGN KEY ("center_id") REFERENCES "public"."centers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "center_liaisons" ADD CONSTRAINT "center_liaisons_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "center_liaisons" ADD CONSTRAINT "center_liaisons_center_id_centers_id_fk" FOREIGN KEY ("center_id") REFERENCES "public"."centers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_categories" ADD CONSTRAINT "event_categories_coordinator_id_users_id_fk" FOREIGN KEY ("coordinator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_coordinator_id_users_id_fk" FOREIGN KEY ("coordinator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_event_category_id_event_categories_id_fk" FOREIGN KEY ("event_category_id") REFERENCES "public"."event_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_center_id_centers_id_fk" FOREIGN KEY ("center_id") REFERENCES "public"."centers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_participant_category_id_participant_categories_id_fk" FOREIGN KEY ("participant_category_id") REFERENCES "public"."participant_categories"("id") ON DELETE cascade ON UPDATE no action;