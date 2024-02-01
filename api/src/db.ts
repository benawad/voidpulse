import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "./schema/users";
import { projects } from "./schema/projects";
import { projectUsers } from "./schema/project-users";
import { boards } from "./schema/boards";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export type DbUser = typeof users.$inferSelect;

export const db = drizzle(pool, {
  schema: {
    users,
    projects,
    projectUsers,
    boards,
  },
});
