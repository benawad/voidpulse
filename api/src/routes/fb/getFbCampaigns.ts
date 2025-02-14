import { z } from "zod";
import { protectedProcedure } from "../../trpc";
import { db } from "../../db";
import { fbCampaignSpend } from "../../schema/fbCampaignSpend";

export const getFbCampaigns = protectedProcedure
  .input(z.object({}))
  .query(async ({ input: {}, ctx: { userId } }) => {
    const campaigns = await db
      .selectDistinctOn([fbCampaignSpend.campaignId])
      .from(fbCampaignSpend);

    return {
      campaigns: campaigns.map((x) => ({
        id: x.campaignId,
        name: x.campaignName,
      })),
    };
  });
