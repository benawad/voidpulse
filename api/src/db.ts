import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "./schema/users";
import { projects } from "./schema/projects";
import { clickhouseMigrations } from "./schema/clickhouse-migrations";
import { projectUsers } from "./schema/project-users";
import { boards } from "./schema/boards";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, {
  schema: {
    users,
    projects,
    clickhouseMigrations,
    projectUsers,
    boards,
  },
});
