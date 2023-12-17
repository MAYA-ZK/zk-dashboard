ALTER TABLE "scroll_batches" RENAME COLUMN "index" TO "number";--> statement-breakpoint
ALTER TABLE "scroll_batches" RENAME COLUMN "created_at" TO "timestamp";--> statement-breakpoint
ALTER TABLE "scroll_batches" DROP CONSTRAINT "scroll_batches_index_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "scroll_batches_index_index";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "scroll_batches_number_index" ON "scroll_batches" ("number");--> statement-breakpoint
ALTER TABLE "scroll_batches" ADD CONSTRAINT "scroll_batches_number_unique" UNIQUE("number");