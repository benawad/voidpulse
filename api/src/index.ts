import "dotenv-safe/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";
import { app } from "./appRouter";
import { runClickhouseMigrations } from "./clickhouse";
import { db } from "./db";
import { kafkaProducer } from "./kafka/kafka";
import { addIngestRoute } from "./routes/express/ingest";
import { addUpdatePeopleRoute } from "./routes/express/update-people";

const startServer = async () => {
  console.log("about to migrate postgres");
  await migrate(db, { migrationsFolder: path.join(__dirname, "../drizzle") });
  console.log("postgres migration complete");
  console.log("about to migrate clickhouse");
  await runClickhouseMigrations();
  console.log("clickhouse migration complete");
  console.log("about to connect to kafka");
  await kafkaProducer.connect();
  console.log("connected to kafka");
  addIngestRoute(app);
  addUpdatePeopleRoute(app);

  app.listen(4001, () => {
    console.log("server started on http://localhost:4001/trpc");
  });
};

startServer();
