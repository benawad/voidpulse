import { sql } from "drizzle-orm";
import { db } from "../../db";
import { fbAdAccount } from "../../fb";
import { fbCampaignSpend } from "../../schema/fbCampaignSpend";
import cron from "node-cron";

const load = async (date_preset: string) => {
  const insights = await fbAdAccount.getInsights(
    ["campaign_id", "campaign_name", "spend", "date_start"],
    {
      level: "campaign",
      date_preset,
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

  if (!insights.length) {
    return;
  }

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
        spend: sql`excluded.spend`,
        campaignName: sql`excluded.campaign_name`,
      },
    });
};

const getTodayDateStr = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

let lastDt = "";
export const loadInitialFbSpend = async () => {
  const currCampaignSpend = await db.query.fbCampaignSpend.findFirst();
  if (!currCampaignSpend) {
    await load("last_3d");
    console.log("campaign spend loaded");
  } else {
    // await load("last_3d");
    console.log("campaign spend already loaded");
  }

  cron.schedule("30 * * * *", () => {
    const td = getTodayDateStr();
    if (td !== lastDt) {
      lastDt = td;
      load("last_3d").catch((err) => {
        console.error(err);
      });
    } else {
      load("today").catch((err) => {
        console.error(err);
      });
    }
  });
};
