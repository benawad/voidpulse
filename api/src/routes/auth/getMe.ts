import { eq } from "drizzle-orm";
import { DbUser, db } from "../../db";
import { users } from "../../schema/users";
import { publicProcedure } from "../../trpc";
import { checkTokens } from "../../utils/createAuthTokens";
import { selectUserFields } from "../../utils/selectUserFields";
import { projectUsers } from "../../schema/project-users";
import { projects } from "../../schema/projects";

export const getMe = publicProcedure.query(async ({ ctx }) => {
  const { id, rid } = ctx.req.cookies;
  let user: DbUser | null | undefined = null;

  try {
    const { userId, user: maybeUser } = await checkTokens(id, rid);
    if (maybeUser) {
      user = maybeUser;
    } else {
      user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });
    }

    return {
      user: user ? selectUserFields(user) : null,
      projects: user
        ? (
            await db
              .select()
              .from(projectUsers)
              .innerJoin(projects, eq(projectUsers.projectId, projects.id))
              .where(eq(projectUsers.userId, userId))
          ).map((x) => x.projects)
        : [],
    };
  } catch {
    return {
      user: null,
      projects: [],
    };
  }
});
