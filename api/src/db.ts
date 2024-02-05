import "dotenv-safe/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "./schema/users";
import { projects } from "./schema/projects";
import { projectUsers } from "./schema/project-users";
import { boards } from "./schema/boards";
import { charts } from "./schema/charts";
import { __prod__ } from "./constants/prod";
import { people } from "./schema/people";
import { peoplePropTypes } from "./schema/people-prop-types";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export type DbUser = typeof users.$inferSelect;

export const db = drizzle(pool, {
  logger: !__prod__,
  schema: {
    users,
    projects,
    projectUsers,
    boards,
    charts,
    people,
    peoplePropTypes,
  },
});
