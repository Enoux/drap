ALTER TABLE "drap"."draft" RENAME COLUMN "registration_closes_at" TO "registration_closed_at";--> statement-breakpoint
ALTER TABLE "drap"."draft" ADD COLUMN "started_at" timestamp with time zone;