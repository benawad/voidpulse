import "dotenv-safe/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "./schema/users";
import { projects } from "./schema/projects";
import { projectUsers } from "./schema/project-users";
import { boards } from "./schema/boards";
import { charts } from "./schema/charts";

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
    charts,
  },
});
