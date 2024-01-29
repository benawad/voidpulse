import { eq } from "drizzle-orm";
import { db } from "../../db";
import { projectUsers } from "../../schema/project-users";
import { projects } from "../../schema/projects";
import { protectedProcedure } from "../../trpc";

export const getProjects = protectedProcedure.query(
  async ({ ctx: { userId } }) => {
    const data = await db
      .select()
      .from(projectUsers)
      .innerJoin(projects, eq(projectUsers.projectId, projects.id))
      .where(eq(projectUsers.userId, userId));

    return {
      projects: data.map((x) => x.projects),
    };
  }
);
