import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema/*.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString:
      "postgresql://postgres:postgres@localhost/voidpulse?schema=public&connection_limit=1&pool_timeout=1",
  },
} satisfies Config;
