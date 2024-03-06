import { TRPCError } from "@trpc/server";
import { eq, InferInsertModel } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { projects } from "../../schema/projects";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";
import { genApiKey } from "../../utils/genApiKey";
import { apiKeyCache } from "../express/middleware/checkApiKeyMiddleware";
import { updateProjectCache } from "../../utils/cache/getProject";
import { defaultTimezone, timezones } from "../../constants/timezones";

export const updateProject = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      data: z.object({
        name: z.string().optional(),
        timezone: z.string().optional(),
        revokeApiKey: z.boolean().optional(),
      }),
    })
  )
  .mutation(async ({ input: { id, data }, ctx: { userId } }) => {
    await assertProjectMember({ projectId: id, userId });

    if (Object.keys(data).length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Empty update",
      });
    }

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
    });

    if (!project) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }

    const { revokeApiKey, timezone, ...values } = data;

    const setData: Partial<InferInsertModel<typeof projects>> = values;

    if (revokeApiKey) {
      delete apiKeyCache[project.apiKey];
      setData.apiKey = genApiKey();
    }

    if (timezone && timezones.has(timezone)) {
      setData.timezone = timezone;
    }

    const [updatedProject] = await db
      .update(projects)
      .set(setData)
      .where(eq(projects.id, id))
      .returning();
    updateProjectCache(updatedProject);

    return { project: updatedProject };
  });
