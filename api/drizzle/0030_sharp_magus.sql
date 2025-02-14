CREATE TABLE IF NOT EXISTS "fb_campaign_spend" (
	"campaign_id" uuid NOT NULL,
	"campaign_name" text NOT NULL,
	"spend" numeric NOT NULL,
	"date" date NOT NULL,
	CONSTRAINT "fb_campaign_spend_campaign_id_date_pk" PRIMARY KEY("campaign_id","date")
);
