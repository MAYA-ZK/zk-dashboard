CREATE TABLE IF NOT EXISTS "linea_blocks" (
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
	CONSTRAINT "linea_blocks_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "linea_blocks_number_index" ON "linea_blocks" ("number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "linea_blocks_timestamp_index" ON "linea_blocks" ("timestamp");