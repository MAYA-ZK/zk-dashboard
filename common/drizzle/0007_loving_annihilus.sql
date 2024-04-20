CREATE TABLE IF NOT EXISTS "line_tx_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"address" varchar,
	"topics" varchar[],
	"data" varchar,
	"block_number" bigint,
	"transaction_hash" varchar,
	"transaction_index" bigint,
	"block_hash" varchar,
	"log_index" bigint,
	"removed" boolean
);
