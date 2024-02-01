import "dotenv-safe/config";
import { app } from "./appRouter";
import { runClickhouseMigrations } from "./clickhouse";
import { kafkaProducer } from "./kafka/kafka";
import { addIngestRoute } from "./routes/express/ingest";

const startServer = async () => {
  await runClickhouseMigrations();
  await kafkaProducer.connect();
  addIngestRoute(app);

  app.listen(4000, () => {
    console.log("server started on http://localhost:4000/trpc");
  });
};

startServer();
