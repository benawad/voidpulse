import "dotenv-safe/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./db";
import path from "path";

migrate(db, { migrationsFolder: path.join(__dirname, "../drizzle") })
  .then(() => {
    console.log("Successfully ran migrations");
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    pool.end();
  });
