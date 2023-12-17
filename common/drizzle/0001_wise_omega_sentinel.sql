CREATE TABLE IF NOT EXISTS "zk_sync_era_batch_receipts" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_id" integer NOT NULL,
	"commit_tx_fee" bigint,
	"proven_tx_fee" bigint,
	"execute_tx_fee" bigint,
	"total_tx_fee" bigint,
	"total_tx_fee_per_unit" bigint
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "zk_sync_era_batch_receipts" ADD CONSTRAINT "zk_sync_era_batch_receipts_batch_id_zk_sync_era_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "zk_sync_era_batches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
