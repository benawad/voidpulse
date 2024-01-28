import { createClient } from "@clickhouse/client";
import fs from "fs";
import path from "path";
import { db } from "./db";
import { clickhouseMigrations } from "./schema/clickhouse-migrations";

export const clickhouse = createClient({
  host: process.env.CLICKHOUSE_HOST ?? "http://localhost:8123",
  username: process.env.CLICKHOUSE_USER ?? "default",
  password: process.env.CLICKHOUSE_PASSWORD ?? "",
  clickhouse_settings: {
    allow_experimental_object_type: 1,
  },
});

const migFolder = path.join(__dirname, "./clickhouse-migrations");

const applyMigration = async (fileName: string) => {
  const migration = await import(path.join(migFolder, fileName));
  await migration.up(clickhouse);
  await db.insert(clickhouseMigrations).values({
    name: fileName,
  });
};

export const runClickhouseMigrations = async () => {
  const appliedMigrations = await db.query.clickhouseMigrations.findMany();

  const migrationFiles = fs
    .readdirSync(migFolder)
    .filter((file) => file.endsWith(".ts"))
    .sort();

  for (const file of migrationFiles) {
    if (!appliedMigrations.find((x) => x.name === file)) {
      await applyMigration(file);
      console.log(`Migration ${file} applied successfully.`);
    }
  }
};
