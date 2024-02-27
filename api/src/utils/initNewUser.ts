import { v4 } from "uuid";
import { db } from "../db";
import { boards } from "../schema/boards";
import * as emoji from "node-emoji";
import { projectUsers } from "../schema/project-users";
import { projects } from "../schema/projects";
import { genApiKey } from "./genApiKey";
import { ProjectRoleId } from "../app-router-type";

export const initNewUser = async (userId: string) => {
  const boardId = v4();
  const [project] = await db
    .insert(projects)
    .values({
      name: "My First Project",
      apiKey: genApiKey(),
    })
    .returning();

  await db.insert(projectUsers).values({
    projectId: project.id,
    userId,
    role: ProjectRoleId.owner,
    boardOrder: [boardId],
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
    project: {
      ...project,
      role: ProjectRoleId.owner,
      boardOrder: [boardId],
    },
    board,
  };
};
