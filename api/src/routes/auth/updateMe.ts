import { TRPCError } from "@trpc/server";
import { InferInsertModel, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { users } from "../../schema/users";
import { protectedProcedure } from "../../trpc";

export const updateMe = protectedProcedure
  .input(
    z.object({
      updateData: z.object({}),
    })
  )
  .mutation(async ({ input: { updateData }, ctx: { userId } }) => {
    if (Object.keys(updateData).length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Empty update",
      });
    }

    const setData: Partial<InferInsertModel<typeof users>> = updateData;

    const [user] = await db
      .update(users)
      .set(setData)
      .where(eq(users.id, userId))
      .returning();

    return { user };
  });
