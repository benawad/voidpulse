import "dotenv-safe/config";
import { app } from "./appRouter";
import { runClickhouseMigrations } from "./clickhouse";
import { kafkaProducer } from "./kafka/kafka";
import { addIngestRoute } from "./routes/express/ingest";
import { addUpdatePeopleRoute } from "./routes/express/update-people";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./db";
import path from "path";

const startServer = async () => {
  await migrate(db, { migrationsFolder: path.join(__dirname, "../drizzle") });
  await runClickhouseMigrations();
  await kafkaProducer.connect();
  addIngestRoute(app);
  addUpdatePeopleRoute(app);

  app.listen(4000, () => {
    console.log("server started on http://localhost:4000/trpc");
  });
};

startServer();
