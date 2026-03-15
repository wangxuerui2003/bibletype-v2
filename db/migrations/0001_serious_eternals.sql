CREATE TABLE "user_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"avatar_path" varchar(255),
	"avatar_mime_type" varchar(128),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bible_verses" ADD COLUMN "osis" varchar(32);--> statement-breakpoint
ALTER TABLE "import_jobs" ADD COLUMN "source" varchar(128);--> statement-breakpoint
ALTER TABLE "import_jobs" ADD COLUMN "logs" text;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_profiles_avatar_path_idx" ON "user_profiles" USING btree ("avatar_path");--> statement-breakpoint
ALTER TABLE "bible_verses" ADD CONSTRAINT "bible_verses_osis_unique" UNIQUE("osis");
