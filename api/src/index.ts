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
