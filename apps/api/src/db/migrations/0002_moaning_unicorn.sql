CREATE TABLE "user_activity_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" integer NOT NULL,
	"karma_points" integer DEFAULT 0 NOT NULL,
	"page_name" varchar(255) DEFAULT '' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user_activity_log" ADD CONSTRAINT "user_activity_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "idx_user_activity_log_user_id" ON "user_activity_log" ("user_id");
--> statement-breakpoint
CREATE INDEX "idx_user_activity_log_activity_type" ON "user_activity_log" ("activity_type");
--> statement-breakpoint
CREATE INDEX "idx_user_activity_log_created_at" ON "user_activity_log" ("created_at");
--> statement-breakpoint
CREATE OR REPLACE VIEW karma_points AS
SELECT user_id, SUM(karma_points)::int AS total_karma_points
FROM user_activity_log
GROUP BY user_id;