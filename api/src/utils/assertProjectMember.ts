import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { projectUsers } from "../schema/project-users";
import { TRPCError } from "@trpc/server";

export const assertProjectMember = async ({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}) => {
  if (
    !(await db.query.projectUsers.findFirst({
      where: and(
        eq(projectUsers.projectId, projectId),
        eq(projectUsers.userId, userId)
      ),
    }))
  ) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are not a member of this project",
    });
  }
};
