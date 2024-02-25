import { ClickHouseLogLevel, createClient } from "@clickhouse/client";
import fs from "fs";
import path from "path";
import { db } from "./db";
import { __prod__ } from "./constants/prod";

export type ClickHouseQueryResponse<T> = {
  meta: { name: string; type: string }[];
  data: T[];
  rows: number;
  statistics: { elapsed: number; rows_read: number; bytes_read: number };
};

export const clickhouse = createClient(
  __prod__
    ? {
        host: "clickhouse",
        username: "default",
        database: "voidpulse",
      }
    : {
        host: process.env.CLICKHOUSE_HOST ?? "http://localhost:8123",
        username: process.env.CLICKHOUSE_USER ?? "default",
        password: process.env.CLICKHOUSE_PASSWORD ?? "",
        database: process.env.CLICKHOUSE_DATABASE ?? "voidpulse",
      }
);

if (!__prod__) {
  const ogQuery = clickhouse.query.bind(clickhouse);
  clickhouse.query = (...params) => {
    console.log(params[0].query);
    return ogQuery(...params);
  };
}

const migFolder = path.join(__dirname, "./clickhouse-migrations");

const applyMigration = async (fileName: string) => {
  const migration = await import(path.join(migFolder, fileName));
  await migration.up(clickhouse);
  await clickhouse.insert({
    table: "migrations",
    values: [{ name: fileName }],
    format: "JSONEachRow",
  });
};

export const runClickhouseMigrations = async () => {
  await clickhouse.command({
    query: `
      CREATE TABLE IF NOT EXISTS migrations (
        name String
      ) ENGINE = MergeTree()
      ORDER BY name;
    `,
  });

  const resp = await clickhouse.query({
    query: `
    SELECT name FROM migrations
  `,
  });
  const appliedMigrations =
    await resp.json<ClickHouseQueryResponse<{ name: string }>>();

  const migrationFiles = fs
    .readdirSync(migFolder)
    .filter((file) => file.endsWith(".ts"))
    .sort();

  for (const file of migrationFiles) {
    if (!appliedMigrations.data.find((x) => x.name === file)) {
      await applyMigration(file);
      console.log(`Migration ${file} applied successfully.`);
    }
  }
};
