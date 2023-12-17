ALTER TABLE "polygon_zk_evm_batch_receipts" DROP CONSTRAINT "polygon_zk_evm_batch_receipts_batch_id_polygon_zk_evm_batches_id_fk";
--> statement-breakpoint
ALTER TABLE "zk_sync_era_batch_receipts" DROP CONSTRAINT "zk_sync_era_batch_receipts_batch_id_zk_sync_era_batches_id_fk";
--> statement-breakpoint
ALTER TABLE "scroll_batch_receipts" ALTER COLUMN "batch_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "polygon_zk_evm_batches" ADD COLUMN "sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "polygon_zk_evm_batches" ADD COLUMN "verified_at" timestamp;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "polygon_zk_evm_batch_receipts_batch_id_index" ON "polygon_zk_evm_batch_receipts" ("batch_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "polygon_zk_evm_blocks_timestamp_index" ON "polygon_zk_evm_blocks" ("timestamp");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "scroll_batch_receipts_batch_id_index" ON "scroll_batch_receipts" ("batch_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "scroll_blocks_timestamp_index" ON "scroll_blocks" ("timestamp");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "zk_sync_era_batch_receipts_batch_id_index" ON "zk_sync_era_batch_receipts" ("batch_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "zk_sync_era_blocks_timestamp_index" ON "zk_sync_era_blocks" ("timestamp");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "polygon_zk_evm_batch_receipts" ADD CONSTRAINT "polygon_zk_evm_batch_receipts_batch_id_polygon_zk_evm_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "polygon_zk_evm_batches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "scroll_batch_receipts" ADD CONSTRAINT "scroll_batch_receipts_batch_id_scroll_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "scroll_batches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "zk_sync_era_batch_receipts" ADD CONSTRAINT "zk_sync_era_batch_receipts_batch_id_zk_sync_era_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "zk_sync_era_batches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
