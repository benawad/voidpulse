require("dotenv").config();
import { clickhouse, runClickhouseMigrations } from "./clickhouse";
import { app } from "./trpc";

const startServer = async () => {
  // app.listen(4000, () => {
  //   console.log("server started on http://localhost:4000/trpc");
  // });
  await runClickhouseMigrations();
};

startServer();
