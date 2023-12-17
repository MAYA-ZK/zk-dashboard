CREATE TABLE IF NOT EXISTS "polygon_zk_evm_batch_receipts" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_id" integer NOT NULL,
	"send_sequences_tx_fee" bigint,
	"verify_batch_tx_fee" bigint,
	"total_tx_fee" bigint,
	"total_tx_fee_per_unit" bigint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "polygon_zk_evm_batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" bigint NOT NULL,
	"timestamp" timestamp NOT NULL,
	"send_sequences_tx_hash" varchar NOT NULL,
	"verify_batch_tx_hash" varchar NOT NULL,
	"acc_input_hash" varchar NOT NULL,
	"blocks" varchar[] NOT NULL,
	"transactions" varchar[] NOT NULL,
	"closed" boolean NOT NULL,
	"coinbase" varchar NOT NULL,
	"global_exit_root" varchar NOT NULL,
	"local_exit_root" varchar NOT NULL,
	"mainnet_exit_root" varchar NOT NULL,
	"rollup_exit_root" varchar NOT NULL,
	"state_root" varchar NOT NULL,
	CONSTRAINT "polygon_zk_evm_batches_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "polygon_zk_evm_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"difficulty" bigint,
	"extra_data" varchar NOT NULL,
	"gas_limit" bigint NOT NULL,
	"gas_used" bigint NOT NULL,
	"hash" varchar,
	"logs_bloom" varchar,
	"miner" varchar NOT NULL,
	"mix_hash" varchar NOT NULL,
	"nonce" bigint NOT NULL,
	"number" bigint NOT NULL,
	"parent_hash" varchar NOT NULL,
	"receipts_root" varchar NOT NULL,
	"sha3_uncles" varchar NOT NULL,
	"size" bigint NOT NULL,
	"state_root" varchar NOT NULL,
	"timestamp" timestamp NOT NULL,
	"transactions_root" varchar NOT NULL,
	"transactions" varchar[] NOT NULL,
	"uncles" varchar[] NOT NULL,
	CONSTRAINT "polygon_zk_evm_blocks_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "polygon_zk_evm_batches_number_index" ON "polygon_zk_evm_batches" ("number");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "polygon_zk_evm_blocks_number_index" ON "polygon_zk_evm_blocks" ("number");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "polygon_zk_evm_batch_receipts" ADD CONSTRAINT "polygon_zk_evm_batch_receipts_batch_id_polygon_zk_evm_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "polygon_zk_evm_batches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
