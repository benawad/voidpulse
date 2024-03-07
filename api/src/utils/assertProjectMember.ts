import { and, eq, gte } from "drizzle-orm";
import { db } from "../db";
import { projectUsers } from "../schema/project-users";
import { TRPCError } from "@trpc/server";
import { ProjectRoleId } from "../app-router-type";

export const assertProjectMember = async ({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}) => {
  const x = await db.query.projectUsers.findFirst({
    where: and(
      eq(projectUsers.projectId, projectId),
      eq(projectUsers.userId, userId)
    ),
  });
  if (!x) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not a member of this project",
    });
  }

  return x;
};
