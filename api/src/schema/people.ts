import { sql } from "drizzle-orm";
import {
  date,
  jsonb,
  pgTable,
  primaryKey,
  text,
  uuid,
} from "drizzle-orm/pg-core";

export const people = pgTable(
  "people",
  {
    distinctId: text("distinct_id").notNull(),
    projectId: uuid("project_id").notNull(),
    properties: jsonb("properties").notNull(),
    createdAt: date("created_at")
      .notNull()
      .default(sql`now()`),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.distinctId, table.projectId] }),
    };
  }
);
