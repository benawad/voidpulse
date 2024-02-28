import { z } from "zod";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";
import { sendProjectInviteEmail } from "../../utils/email/sendProjectInviteEmail";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { users } from "../../schema/users";
import { TRPCError } from "@trpc/server";
import { projects } from "../../schema/projects";

export const sendProjectInvite = protectedProcedure
  .input(
    z.object({
      email: z.string().min(3).max(255),
      projectId: z.string(),
    })
  )
  .mutation(async ({ input: { email, projectId }, ctx }) => {
    await assertProjectMember({ projectId, userId: ctx.userId });

    const sender = await db.query.users.findFirst({
      where: eq(users.id, ctx.userId),
    });

    if (!sender) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Try refreshing",
      });
    }

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });

    if (!project) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Project not found",
      });
    }

    await sendProjectInviteEmail({
      inviteSenderEmail: sender.email,
      projectId,
      toEmail: email,
      projectName: project.name,
    });

    return {
      ok: true,
    };
  });
