import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { projectUsers } from "../../schema/project-users";
import { projects } from "../../schema/projects";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import { boards } from "../../schema/boards";

export const getProjects = protectedProcedure
  .input(
    z.object({
      currProjectId: z.string().optional(),
    })
  )
  .query(async ({ input, ctx: { userId } }) => {
    const data = await db
      .select()
      .from(projectUsers)
      .innerJoin(projects, eq(projectUsers.projectId, projects.id))
      .where(eq(projectUsers.userId, userId));

    if (!data.length) {
      return {
        projects: [],
        boards: [],
      };
    }

    const dashboards = await db.query.boards.findMany({
      where: and(
        eq(boards.projectId, input.currProjectId || data[0].projects.id),
        eq(boards.creatorId, userId)
      ),
    });

    return {
      projects: data.map((x) => x.projects),
      boards: dashboards,
    };
  });
