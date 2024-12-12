import { sql } from "drizzle-orm";
import {
  date,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { DataType } from "../app-router-type";

export const eventPropTypes = pgTable(
  "event_prop_types",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    eventValue: text("event_value").notNull(),
    propTypes: jsonb("prop_types")
      .$type<Record<string, { type: DataType }>>()
      .notNull(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`now()`),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.eventValue] }),
  })
);
