CREATE TABLE IF NOT EXISTS "eth_usd_price" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"price" integer NOT NULL,
	CONSTRAINT "eth_usd_price_date_unique" UNIQUE("date")
);
