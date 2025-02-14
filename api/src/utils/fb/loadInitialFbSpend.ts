import { sql } from "drizzle-orm";
import { db } from "../../db";
import { fbAdAccount } from "../../fb";
import { fbCampaignSpend } from "../../schema/fbCampaignSpend";
import fs from "fs";

export const loadInitialFbSpend = async () => {
  const currCampaignSpend = await db.query.fbCampaignSpend.findFirst();
  if (currCampaignSpend) {
    console.log("campaign spend already loaded");
    return;
  }

  const insights = await fbAdAccount.getInsights(
    ["campaign_id", "campaign_name", "spend", "date_start"],
    {
      level: "campaign",
      date_preset: "maximum",
      limit: 1000,
      time_increment: 1,
      filtering: [
        {
          field: "spend",
          operator: "GREATER_THAN",
          value: 0,
        },
      ],
    }
  );

  // fs.writeFileSync("insights.json", JSON.stringify(insights, null, 2));
  // const insightsJson = fs.readFileSync("insights.json", "utf8");
  // const insights = JSON.parse(insightsJson).map((x: any) => x._data);

  await db
    .insert(fbCampaignSpend)
    .values(
      insights.map((x: any) => ({
        campaignId: x.campaign_id,
        campaignName: x.campaign_name,
        spend: x.spend,
        date: x.date_start,
      }))
    )
    .onConflictDoUpdate({
      target: [fbCampaignSpend.campaignId, fbCampaignSpend.date],
      set: {
        spend: sql`${fbCampaignSpend.spend}`,
        campaignName: sql`${fbCampaignSpend.campaignName}`,
      },
    });
  console.log("campaign spend loaded");
};
