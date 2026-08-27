CREATE SCHEMA IF NOT EXISTS "time_card_calculator";
--> statement-breakpoint
CREATE TABLE "time_card_calculator"."account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_card_calculator"."session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "time_card_calculator"."time_card" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"report_header" text,
	"notes" text,
	"calculator_type" text NOT NULL,
	"source_path" text NOT NULL,
	"period_type" text NOT NULL,
	"period_start" date,
	"period_end" date,
	"payment_enabled" boolean DEFAULT false NOT NULL,
	"currency" varchar(3),
	"hourly_rate" numeric(12, 4),
	"settings" jsonb NOT NULL,
	"cached_total_minutes" integer DEFAULT 0 NOT NULL,
	"cached_total_pay" numeric(14, 4),
	"schema_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "time_card_calculator"."time_card_row" (
	"id" text PRIMARY KEY NOT NULL,
	"time_card_id" text NOT NULL,
	"position" integer NOT NULL,
	"work_date" date,
	"day_label" text NOT NULL,
	"punches" jsonb NOT NULL,
	"breaks" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_card_calculator"."user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "time_card_calculator"."verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "time_card_calculator"."account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "time_card_calculator"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_card_calculator"."session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "time_card_calculator"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_card_calculator"."time_card" ADD CONSTRAINT "time_card_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "time_card_calculator"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_card_calculator"."time_card_row" ADD CONSTRAINT "time_card_row_time_card_id_time_card_id_fk" FOREIGN KEY ("time_card_id") REFERENCES "time_card_calculator"."time_card"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "account_provider_account_uidx" ON "time_card_calculator"."account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "account_user_idx" ON "time_card_calculator"."account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "time_card_calculator"."session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "time_card_user_updated_idx" ON "time_card_calculator"."time_card" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE INDEX "time_card_user_deleted_updated_idx" ON "time_card_calculator"."time_card" USING btree ("user_id","deleted_at","updated_at");--> statement-breakpoint
CREATE INDEX "time_card_active_user_idx" ON "time_card_calculator"."time_card" USING btree ("user_id") WHERE "time_card_calculator"."time_card"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "time_card_row_card_position_uidx" ON "time_card_calculator"."time_card_row" USING btree ("time_card_id","position");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "time_card_calculator"."verification" USING btree ("identifier");
