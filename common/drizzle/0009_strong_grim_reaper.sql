ALTER TABLE "linea_transactions" ADD COLUMN "decoded_last_finalized_timestamp" timestamp;--> statement-breakpoint
ALTER TABLE "linea_transactions" ADD COLUMN "decoded_final_timestamp" timestamp;--> statement-breakpoint
ALTER TABLE "linea_transactions" ADD COLUMN "decoded_final_block_number" bigint;