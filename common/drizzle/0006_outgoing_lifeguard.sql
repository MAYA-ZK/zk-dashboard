CREATE TABLE IF NOT EXISTS "linea_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"block_number" bigint NOT NULL,
	"timestamp" timestamp NOT NULL,
	"hash" varchar NOT NULL,
	"nonce" bigint NOT NULL,
	"block_hash" varchar NOT NULL,
	"transaction_index" integer NOT NULL,
	"from" varchar NOT NULL,
	"to" varchar NOT NULL,
	"value" numeric NOT NULL,
	"gas" bigint NOT NULL,
	"gas_price" bigint NOT NULL,
	"tx_receipt_status" varchar,
	"input" varchar NOT NULL,
	"contract_address" varchar NOT NULL,
	"cumulative_gas_used" bigint NOT NULL,
	"gas_used" bigint NOT NULL,
	"confirmations" integer,
	"methodId" varchar NOT NULL,
	"function_name" varchar NOT NULL
);