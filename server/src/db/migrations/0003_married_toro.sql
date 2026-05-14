CREATE TABLE "comparison_set_comment_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"comment_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"reaction_type" varchar(10) DEFAULT 'like' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "comparison_set_comment_reactions_comment_id_user_id_unique" UNIQUE("comment_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "comparison_set_comment_reactions" ADD CONSTRAINT "comparison_set_comment_reactions_comment_id_comparison_set_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comparison_set_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comparison_set_comment_reactions" ADD CONSTRAINT "comparison_set_comment_reactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;