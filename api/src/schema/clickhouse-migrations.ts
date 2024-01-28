import { sql } from "drizzle-orm";
import { pgTable, text, uuid, date } from "drizzle-orm/pg-core";

export const clickhouseMigrations = pgTable("clickhouse_migrations", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v4()`),
  name: text("name").notNull(),
  appliedOn: date("applied_on").default("now()"),
});
