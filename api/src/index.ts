import "dotenv-safe/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";
import { app } from "./appRouter";
import { clickhouse, runClickhouseMigrations } from "./clickhouse";
import { db } from "./db";
import { kafkaProducer } from "./kafka/kafka";
import { addIngestRoute } from "./routes/express/ingest";
import { addUpdatePeopleRoute } from "./routes/express/update-people";
import { __prod__ } from "./constants/prod";
import { sleep } from "./utils/sleep";

const startServer = async () => {
  console.log("about to migrate postgres");
  await migrate(db, { migrationsFolder: path.join(__dirname, "../drizzle") });
  console.log("postgres migration complete");
  console.log("see if clickhouse connection is working");
  for (let i = 0; i++; i < 10) {
    try {
      await clickhouse.query({ query: "SELECT 1" });
      break;
    } catch {}
    console.log(
      "clickhouse connection failed, sleeping for " + (i + 1) + " seconds"
    );
    sleep((i + 1) * 1000);
    console.log("retrying now...");
  }
  console.log("connected to clickhouse");
  console.log("about to migrate clickhouse");
  await runClickhouseMigrations();
  console.log("clickhouse migration complete");
  console.log("about to connect to kafka");
  await kafkaProducer.connect();
  console.log("connected to kafka");
  addIngestRoute(app);
  addUpdatePeopleRoute(app);

  app.listen(__prod__ ? 3000 : 4001, () => {
    console.log("server started on http://localhost:4001/trpc");
  });
};

startServer();
