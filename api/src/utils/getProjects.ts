import { eq } from "drizzle-orm";
import { db } from "../db";
import { projectUsers } from "../schema/project-users";
import { projects } from "../schema/projects";

export const getProjects = (userId: string) => {
  return db
    .select()
    .from(projectUsers)
    .innerJoin(projects, eq(projectUsers.projectId, projects.id))
    .where(eq(projectUsers.userId, userId))
    .then((result) =>
      result.map((x) => ({
        ...x.projects,
        role: x.project_users.role,
        boardOrder: x.project_users.boardOrder,
      }))
    );
};
