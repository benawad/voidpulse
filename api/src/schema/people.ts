import { sql } from "drizzle-orm";
import {
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const people = pgTable(
  "people",
  {
    distinctId: text("distinct_id").notNull(),
    projectId: uuid("project_id").notNull(),
    properties: jsonb("properties").notNull(),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`now()`),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.distinctId, table.projectId] }),
    };
  }
);
