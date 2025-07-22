import "./utils/custom-dotenv";
// keep ^ that at the top
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";
import { app } from "./appRouter";
import { clickhouse, runClickhouseMigrations } from "./clickhouse";
import { db } from "./db";
import { ClickHouseLogLevel, createClient } from "@clickhouse/client";
import { kafkaProducer } from "./kafka/kafka";
import { addIngestRoute } from "./routes/express/ingest";
import { addUpdatePeopleRoute } from "./routes/express/update-people";
import { __cloud__, __prod__ } from "./constants/prod";
import { sleep } from "./utils/sleep";
import { tryToConnect } from "./utils/tryToConnect";
import { normalizeOsDataMigration } from "./data-migrations/normalizeOs";
import { loadInitialFbSpend } from "./utils/fb/loadInitialFbSpend";
import querySheetHandler from "./routes/query/querySheet";

const startServer = async () => {
  console.log("about to migrate postgres");
  await migrate(db, { migrationsFolder: path.join(__dirname, "../drizzle") });
  console.log("postgres migration complete");
  if (__prod__) {
    const systemClient = createClient({
      host: "http://clickhouse:8123",
      username: "default",
      password: "",
      database: "",
    });
    await systemClient.query({
      query: `CREATE DATABASE IF NOT EXISTS voidpulse`,
    });
    await systemClient.close();
  }
  await tryToConnect(
    () => clickhouse.query({ query: "SELECT 1" }),
    "clickhouse"
  );
  console.log("connected to clickhouse");
  console.log("about to migrate clickhouse");
  await runClickhouseMigrations();
  console.log("clickhouse migration complete");
  console.log("about to connect to kafka");
  await tryToConnect(() => kafkaProducer.connect(), "kafka");
  console.log("connected to kafka");
  addIngestRoute(app);
  addUpdatePeopleRoute(app);
  app.get("/query", querySheetHandler);
  loadInitialFbSpend().catch((err) => {
    console.error(err);
  });

  // if (__prod__) {
  //   normalizeOsDataMigration();
  // }

  app.listen(__prod__ ? (__cloud__ ? process.env.PORT : 3000) : 4001, () => {
    console.log("server started on http://localhost:4001/trpc");
  });
};

startServer();
