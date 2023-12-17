CREATE TABLE IF NOT EXISTS "scroll_batch_receipts" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_id" integer,
	"commit_tx_effective_price" numeric,
	"finalize_tx_effective_price" numeric,
	"total_tx_effective_price" numeric,
	"total_tx_effective_unit_price" numeric
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scroll_batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"index" integer,
	"hash" varchar,
	"rollup_status" varchar,
	"created_at" timestamp,
	"total_tx_num" integer NOT NULL,
	"commit_tx_hash" varchar,
	"finalize_tx_hash" varchar,
	"committed_at" timestamp,
	"end_block_number" integer,
	"end_chunk_hash" varchar,
	"end_chunk_index" integer,
	"finalized_at" timestamp,
	"start_block_number" integer,
	"start_chunk_hash" varchar,
	"start_chunk_index" integer,
	CONSTRAINT "scroll_batches_index_unique" UNIQUE("index")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scroll_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"base_fee_per_gas" bigint,
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
	"total_difficulty" bigint NOT NULL,
	"transactions_root" varchar NOT NULL,
	"transactions" varchar[] NOT NULL,
	"uncles" varchar[] NOT NULL,
	CONSTRAINT "scroll_blocks_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "zk_sync_era_batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" bigint NOT NULL,
	"timestamp" timestamp NOT NULL,
	"status" varchar NOT NULL,
	"commit_tx_hash" varchar NOT NULL,
	"committed_at" timestamp NOT NULL,
	"execute_tx_hash" varchar NOT NULL,
	"executed_at" timestamp NOT NULL,
	"prove_tx_hash" varchar NOT NULL,
	"proven_at" timestamp NOT NULL,
	"l1_gas_price" bigint NOT NULL,
	"l1_tx_count" integer NOT NULL,
	"l2_fair_gas_price" bigint NOT NULL,
	"l2_tx_count" integer NOT NULL,
	"root_hash" varchar NOT NULL,
	"base_system_contracts_hashes_bootloader" varchar NOT NULL,
	"base_system_contracts_hashes_default_aa" varchar NOT NULL,
	CONSTRAINT "zk_sync_era_batches_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "zk_sync_era_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"base_fee_per_gas" bigint,
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
	"total_difficulty" bigint NOT NULL,
	"transactions_root" varchar NOT NULL,
	"transactions" varchar[] NOT NULL,
	"uncles" varchar[] NOT NULL,
	CONSTRAINT "zk_sync_era_blocks_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "scroll_batches_index_index" ON "scroll_batches" ("index");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "scroll_blocks_number_index" ON "scroll_blocks" ("number");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "zk_sync_era_batches_number_index" ON "zk_sync_era_batches" ("number");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "zk_sync_era_blocks_number_index" ON "zk_sync_era_blocks" ("number");