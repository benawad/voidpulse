import {
  date,
  doublePrecision,
  pgTable,
  primaryKey,
  text,
} from "drizzle-orm/pg-core";

export const fbCampaignSpend = pgTable(
  "fb_campaign_spend",
  {
    campaignId: text("campaign_id").notNull(),
    campaignName: text("campaign_name").notNull(),
    spend: doublePrecision("spend").notNull(),
    date: date("date").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.campaignId, table.date] }),
    };
  }
);
