CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'user',
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_audit_logs" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"actor_user_id" text NOT NULL,
	"action" varchar(128) NOT NULL,
	"target_type" varchar(64) NOT NULL,
	"target_id" varchar(64) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bible_books" (
	"id" varchar(48) PRIMARY KEY NOT NULL,
	"testament" varchar(2) NOT NULL,
	"slug" varchar(128) NOT NULL,
	"name" varchar(128) NOT NULL,
	"ordered_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bible_books_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "bible_verses" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"book_id" varchar(48) NOT NULL,
	"chapter" integer NOT NULL,
	"verse" integer NOT NULL,
	"reference" varchar(128) NOT NULL,
	"sequence" integer NOT NULL,
	"text_raw" text NOT NULL,
	"text_normalized" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bible_verses_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "biblical_places" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"slug" varchar(128) NOT NULL,
	"name" varchar(128) NOT NULL,
	"aliases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"place_type" varchar(64) DEFAULT 'place' NOT NULL,
	"confidence" real DEFAULT 1 NOT NULL,
	"source" varchar(64) DEFAULT 'seed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "biblical_places_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"type" varchar(32) NOT NULL,
	"status" varchar(32) DEFAULT 'open' NOT NULL,
	"content" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "import_jobs" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"type" varchar(64) NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "place_geometries" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"place_id" varchar(64) NOT NULL,
	"lat" real,
	"lng" real,
	"geojson" jsonb DEFAULT 'null'::jsonb,
	"label" varchar(128)
);
--> statement-breakpoint
CREATE TABLE "race_lobbies" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"code" varchar(12) NOT NULL,
	"host_user_id" text NOT NULL,
	"mode" varchar(16) NOT NULL,
	"target_players" integer NOT NULL,
	"status" varchar(32) DEFAULT 'waiting' NOT NULL,
	"verse_id" varchar(64),
	"countdown_started_at" timestamp,
	"started_at" timestamp,
	"finished_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "race_lobbies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "race_participants" (
	"lobby_id" varchar(64) NOT NULL,
	"user_id" text NOT NULL,
	"slot_index" integer NOT NULL,
	"ready" boolean DEFAULT false NOT NULL,
	"connected" boolean DEFAULT true NOT NULL,
	"completed_chars" integer DEFAULT 0 NOT NULL,
	"finished_at" timestamp,
	CONSTRAINT "race_participants_lobby_id_user_id_pk" PRIMARY KEY("lobby_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "race_results" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"lobby_id" varchar(64) NOT NULL,
	"user_id" text NOT NULL,
	"placement" integer NOT NULL,
	"elapsed_ms" integer NOT NULL,
	"accuracy" real NOT NULL,
	"wpm" real NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "typing_attempts" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"verse_id" varchar(64) NOT NULL,
	"elapsed_ms" integer NOT NULL,
	"accuracy" real NOT NULL,
	"wpm" real NOT NULL,
	"typed_chars" integer NOT NULL,
	"correct_chars" integer NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"user_id" text PRIMARY KEY NOT NULL,
	"current_verse_id" varchar(64),
	"completed_verses" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verse_places" (
	"verse_id" varchar(64) NOT NULL,
	"place_id" varchar(64) NOT NULL,
	"source" varchar(64) DEFAULT 'seed' NOT NULL,
	"confidence" real DEFAULT 1 NOT NULL,
	"admin_confirmed" boolean DEFAULT false NOT NULL,
	CONSTRAINT "verse_places_verse_id_place_id_pk" PRIMARY KEY("verse_id","place_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bible_verses" ADD CONSTRAINT "bible_verses_book_id_bible_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."bible_books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "place_geometries" ADD CONSTRAINT "place_geometries_place_id_biblical_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."biblical_places"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_lobbies" ADD CONSTRAINT "race_lobbies_host_user_id_user_id_fk" FOREIGN KEY ("host_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_lobbies" ADD CONSTRAINT "race_lobbies_verse_id_bible_verses_id_fk" FOREIGN KEY ("verse_id") REFERENCES "public"."bible_verses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_participants" ADD CONSTRAINT "race_participants_lobby_id_race_lobbies_id_fk" FOREIGN KEY ("lobby_id") REFERENCES "public"."race_lobbies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_participants" ADD CONSTRAINT "race_participants_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_results" ADD CONSTRAINT "race_results_lobby_id_race_lobbies_id_fk" FOREIGN KEY ("lobby_id") REFERENCES "public"."race_lobbies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_results" ADD CONSTRAINT "race_results_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "typing_attempts" ADD CONSTRAINT "typing_attempts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "typing_attempts" ADD CONSTRAINT "typing_attempts_verse_id_bible_verses_id_fk" FOREIGN KEY ("verse_id") REFERENCES "public"."bible_verses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_current_verse_id_bible_verses_id_fk" FOREIGN KEY ("current_verse_id") REFERENCES "public"."bible_verses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verse_places" ADD CONSTRAINT "verse_places_verse_id_bible_verses_id_fk" FOREIGN KEY ("verse_id") REFERENCES "public"."bible_verses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verse_places" ADD CONSTRAINT "verse_places_place_id_biblical_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."biblical_places"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "admin_audit_logs_actor_idx" ON "admin_audit_logs" USING btree ("actor_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bible_books_ordered_id_idx" ON "bible_books" USING btree ("ordered_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bible_verses_book_chapter_verse_idx" ON "bible_verses" USING btree ("book_id","chapter","verse");--> statement-breakpoint
CREATE UNIQUE INDEX "bible_verses_sequence_idx" ON "bible_verses" USING btree ("sequence");--> statement-breakpoint
CREATE INDEX "feedback_status_idx" ON "feedback" USING btree ("status");--> statement-breakpoint
CREATE INDEX "import_jobs_type_idx" ON "import_jobs" USING btree ("type");--> statement-breakpoint
CREATE INDEX "place_geometries_place_idx" ON "place_geometries" USING btree ("place_id");--> statement-breakpoint
CREATE INDEX "race_lobbies_status_idx" ON "race_lobbies" USING btree ("status");--> statement-breakpoint
CREATE INDEX "race_results_lobby_idx" ON "race_results" USING btree ("lobby_id");--> statement-breakpoint
CREATE INDEX "typing_attempts_user_idx" ON "typing_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "typing_attempts_verse_idx" ON "typing_attempts" USING btree ("verse_id");--> statement-breakpoint
CREATE INDEX "user_progress_current_verse_idx" ON "user_progress" USING btree ("current_verse_id");