import * as emoji from "node-emoji";
import { z } from "zod";
import { db } from "../../db";
import { boards } from "../../schema/boards";
import { projectUsers } from "../../schema/project-users";
import { projects } from "../../schema/projects";
import { protectedProcedure } from "../../trpc";
import { genApiKey } from "../../utils/genApiKey";
import { v4 } from "uuid";
import { ProjectRoleId } from "../../app-router-type";

export const createProject = protectedProcedure
  .input(
    z.object({
      name: z.string(),
    })
  )
  .mutation(async ({ input: { name }, ctx: { userId } }) => {
    const boardId = v4();
    const [project] = await db
      .insert(projects)
      .values({
        name,
        apiKey: genApiKey(),
      })
      .returning();

    await db.insert(projectUsers).values({
      projectId: project.id,
      userId,
      boardOrder: [boardId],
      role: ProjectRoleId.owner,
    });

    const [board] = await db
      .insert(boards)
      .values({
        id: boardId,
        creatorId: userId,
        emoji: emoji.random().emoji,
        title: "My First Board",
        projectId: project.id,
      })
      .returning();

    return {
      project,
      board,
    };
  });
