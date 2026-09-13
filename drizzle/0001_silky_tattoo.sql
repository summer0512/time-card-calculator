ALTER TABLE "time_card_calculator"."time_card" ADD COLUMN "share_id" text;--> statement-breakpoint
ALTER TABLE "time_card_calculator"."time_card" ADD COLUMN "share_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "time_card_calculator"."time_card" ADD COLUMN "shared_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "time_card_share_id_uidx" ON "time_card_calculator"."time_card" USING btree ("share_id");