import { eq } from "drizzle-orm";
import { db } from "../../db";
import { projects } from "../../schema/projects";

type Project = typeof projects.$inferSelect;

const cache: Record<string, Project | undefined> = {};
export const updateProjectCache = (project: Project) => {
  cache[project.id] = project;
};
export const getProject = async (id: string) => {
  if (!(id in cache)) {
    cache[id] = await db.query.projects.findFirst({
      where: eq(projects.id, id),
    });
  }

  return cache[id];
};
