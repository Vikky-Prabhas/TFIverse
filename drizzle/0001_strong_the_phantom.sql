CREATE TYPE "public"."data_state_enum" AS ENUM('LIVE', 'RECENT', 'ESTIMATED', 'REPORTED', 'FINAL', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."territory_enum" AS ENUM('NIZAM', 'CEDED', 'UA', 'EAST', 'WEST', 'GUNTUR', 'KRISHNA', 'NELLORE', 'KARNATAKA', 'TAMIL_NADU', 'KERALA', 'NORTH_INDIA', 'OVERSEAS', 'UNKNOWN');--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"reporter_id" uuid NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" varchar(100) NOT NULL,
	"reason" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"admin_comment" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suggestions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" varchar(100) NOT NULL,
	"suggestion_data" jsonb NOT NULL,
	"reason" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"admin_comment" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chain_box_office" (
	"id" serial PRIMARY KEY NOT NULL,
	"movie_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"chain" varchar(100) NOT NULL,
	"shows" integer DEFAULT 0 NOT NULL,
	"ff_count" integer DEFAULT 0 NOT NULL,
	"hf_count" integer DEFAULT 0 NOT NULL,
	"sold" integer DEFAULT 0 NOT NULL,
	"gross" real DEFAULT 0 NOT NULL,
	"occupancy" real DEFAULT 0 NOT NULL,
	"atp" real DEFAULT 0 NOT NULL,
	"data_state" "data_state_enum" DEFAULT 'UNKNOWN' NOT NULL,
	"data_source" varchar(100),
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "unique_cbo_movie_date_chain" UNIQUE("movie_id","date","chain")
);
--> statement-breakpoint
CREATE TABLE "city_booking_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"movie_id" integer NOT NULL,
	"city" varchar(100) NOT NULL,
	"territory" "territory_enum" DEFAULT 'UNKNOWN' NOT NULL,
	"show_date" timestamp NOT NULL,
	"snapshot_timestamp" timestamp NOT NULL,
	"tickets_sold" integer NOT NULL,
	"gross_revenue" real NOT NULL,
	"shows_count" integer NOT NULL,
	"capacity" integer NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "unique_city_adv_snapshot" UNIQUE("movie_id","city","show_date","snapshot_timestamp")
);
--> statement-breakpoint
CREATE TABLE "daily_box_office" (
	"id" serial PRIMARY KEY NOT NULL,
	"movie_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"gross" real DEFAULT 0 NOT NULL,
	"nett" real DEFAULT 0 NOT NULL,
	"tickets_sold" integer DEFAULT 0 NOT NULL,
	"shows" integer DEFAULT 0 NOT NULL,
	"occupancy" real DEFAULT 0 NOT NULL,
	"data_state" "data_state_enum" DEFAULT 'UNKNOWN' NOT NULL,
	"data_source" varchar(100),
	"ff_count" integer DEFAULT 0 NOT NULL,
	"hf_count" integer DEFAULT 0 NOT NULL,
	"venues" integer DEFAULT 0 NOT NULL,
	"screens" integer DEFAULT 0 NOT NULL,
	"cities" integer DEFAULT 0 NOT NULL,
	"states" integer DEFAULT 0 NOT NULL,
	"atp" real DEFAULT 0 NOT NULL,
	"pic_gross" real DEFAULT 0 NOT NULL,
	"pic_tickets" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "unique_dbo_movie_date" UNIQUE("movie_id","date")
);
--> statement-breakpoint
CREATE TABLE "hourly_trending_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"movie_id" integer NOT NULL,
	"timestamp" timestamp NOT NULL,
	"sold_tickets" integer NOT NULL,
	"gross_revenue" real NOT NULL,
	"shows_count" integer NOT NULL,
	"average_occupancy" real NOT NULL,
	CONSTRAINT "unique_movie_hour" UNIQUE("movie_id","timestamp")
);
--> statement-breakpoint
CREATE TABLE "movie_financials" (
	"id" serial PRIMARY KEY NOT NULL,
	"movie_id" integer NOT NULL,
	"production_budget" real,
	"pre_release_business" real,
	"theatrical_rights" real,
	"theatrical_break_even" real,
	"worldwide_gross" real,
	"worldwide_share" real,
	"distributor_share" real,
	"financial_state" "data_state_enum" DEFAULT 'UNKNOWN' NOT NULL,
	"source" varchar(100),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "unique_movie_financial" UNIQUE("movie_id")
);
--> statement-breakpoint
CREATE TABLE "realtime_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"movie_id" integer NOT NULL,
	"session_id" varchar(100) NOT NULL,
	"venue_name" varchar(255) NOT NULL,
	"chain_name" varchar(100),
	"city" varchar(100) NOT NULL,
	"state" varchar(100),
	"show_date" timestamp NOT NULL,
	"show_time" varchar(50) NOT NULL,
	"audi" varchar(100),
	"total_seats" integer NOT NULL,
	"available_seats" integer NOT NULL,
	"sold_seats" integer NOT NULL,
	"gross_revenue" real NOT NULL,
	"source" varchar(10) NOT NULL,
	"last_updated" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "unique_session" UNIQUE("movie_id","session_id")
);
--> statement-breakpoint
CREATE TABLE "regional_box_office" (
	"id" serial PRIMARY KEY NOT NULL,
	"movie_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"state" varchar(100) NOT NULL,
	"city" varchar(100) NOT NULL,
	"shows" integer DEFAULT 0 NOT NULL,
	"ff_count" integer DEFAULT 0 NOT NULL,
	"hf_count" integer DEFAULT 0 NOT NULL,
	"sold" integer DEFAULT 0 NOT NULL,
	"gross" real DEFAULT 0 NOT NULL,
	"occupancy" real DEFAULT 0 NOT NULL,
	"atp" real DEFAULT 0 NOT NULL,
	"territory" "territory_enum" DEFAULT 'UNKNOWN' NOT NULL,
	"data_state" "data_state_enum" DEFAULT 'UNKNOWN' NOT NULL,
	"data_source" varchar(100),
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "unique_rbo_movie_date_region" UNIQUE("movie_id","date","state","city")
);
--> statement-breakpoint
CREATE TABLE "sync_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"service" varchar(50) NOT NULL,
	"status" varchar(20) NOT NULL,
	"message" text,
	"metadata" jsonb,
	"started_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "venues" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" varchar(100) NOT NULL,
	"source" varchar(10) NOT NULL,
	"name" varchar(255) NOT NULL,
	"chain" varchar(100),
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"territory" "territory_enum" DEFAULT 'UNKNOWN' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "unique_venue_source" UNIQUE("source_id","source")
);
--> statement-breakpoint
ALTER TABLE "movies" ADD COLUMN "last_ott_sync_at" timestamp;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chain_box_office" ADD CONSTRAINT "chain_box_office_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "city_booking_snapshots" ADD CONSTRAINT "city_booking_snapshots_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_box_office" ADD CONSTRAINT "daily_box_office_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hourly_trending_logs" ADD CONSTRAINT "hourly_trending_logs_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_financials" ADD CONSTRAINT "movie_financials_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "realtime_sessions" ADD CONSTRAINT "realtime_sessions_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regional_box_office" ADD CONSTRAINT "regional_box_office_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_reports_status" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_reports_entity" ON "reports" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_suggestions_status" ON "suggestions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_suggestions_entity" ON "suggestions" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_suggestions_user" ON "suggestions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_cbo_movie" ON "chain_box_office" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "idx_city_adv_booking_query" ON "city_booking_snapshots" USING btree ("movie_id","city","show_date","snapshot_timestamp");--> statement-breakpoint
CREATE INDEX "idx_dbo_movie" ON "daily_box_office" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "idx_dbo_date" ON "daily_box_office" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_hourly_trending_movie" ON "hourly_trending_logs" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "idx_realtime_movie_session" ON "realtime_sessions" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "idx_realtime_city" ON "realtime_sessions" USING btree ("city");--> statement-breakpoint
CREATE INDEX "idx_realtime_date" ON "realtime_sessions" USING btree ("show_date");--> statement-breakpoint
CREATE INDEX "idx_rbo_movie" ON "regional_box_office" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "idx_sync_service" ON "sync_logs" USING btree ("service");--> statement-breakpoint
CREATE INDEX "idx_sync_status" ON "sync_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_venues_city" ON "venues" USING btree ("city");--> statement-breakpoint
CREATE INDEX "idx_venues_state" ON "venues" USING btree ("state");--> statement-breakpoint
CREATE INDEX "idx_venues_territory" ON "venues" USING btree ("territory");--> statement-breakpoint
CREATE INDEX "idx_venues_source" ON "venues" USING btree ("source");--> statement-breakpoint
ALTER TABLE "meme_likes" ADD CONSTRAINT "user_meme_like_unique" UNIQUE("user_id","meme_id");--> statement-breakpoint
ALTER TABLE "meme_views" ADD CONSTRAINT "user_meme_view_unique" UNIQUE("user_id","meme_id");--> statement-breakpoint
ALTER TABLE "user_follows" ADD CONSTRAINT "unique_user_follow" UNIQUE("followerId","followingId");