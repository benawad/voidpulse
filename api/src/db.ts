import "./utils/custom-dotenv";
// keep ^ that at the top
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { __prod__ } from "./constants/prod";
import { boards } from "./schema/boards";
import { charts } from "./schema/charts";
import { messages } from "./schema/messages";
import { people } from "./schema/people";
import { peoplePropTypes } from "./schema/people-prop-types";
import { projectUsers } from "./schema/project-users";
import { projects } from "./schema/projects";
import { users } from "./schema/users";

const devDbUrl =
  "postgresql://postgres:postgres@localhost/voidpulse?schema=public&connection_limit=1&pool_timeout=1";

export const pool = new Pool(
  __prod__
    ? {
        host: "postgres",
        database: "voidpulse",
        user: "youruser",
        password: "yourpassword",
        port: 5432,
      }
    : {
        connectionString: devDbUrl,
      }
);

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
    messages,
  },
});
