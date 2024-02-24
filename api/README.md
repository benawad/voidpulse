## Setting Up Development Environment

1. Ensure that you have ClickHouse up and running:

   - Provide the `CLICKHOUSE_HOST` if it differs from the default (`http://localhost:8123`).
   - Provide the `CLICKHOUSE_DATABASE` if it differs from the default (`voidpulse`).

2. Make sure Kafka is running.

3. Ensure that your PostgreSQL database is up and running:

   - Provide the connection configuration in `DATABASE_URL`:

     ```bash
     DATABASE_URL=postgresql://petvoidenjoyer:secretpassword@localhost:5432/petvoid
     ```

4. Run database migrations:

   ```bash
   pnpm dlx tsx src/migrate.ts
   ```

5. Specify `FRONTEND_URL` for CORS purposes:

   ```bash
   FRONTEND_URL=http://localhost:3000
   ```

6. Ensure that you have filled in the remaining `.env` variables:

   ```bash
   # Double-check with .env.example to ensure that all environment variables are set
   DATABASE_URL=postgresql://petvoidenjoyer:secretpassword@localhost:5432/petvoid
   DOMAIN=localhost
   FRONTEND_URL=http://localhost:3000
   REFRESH_TOKEN_SECRET=shhhhh
   ACCESS_TOKEN_SECRET=shhhhh
   ```

## Getting Started

Start the server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Now, you should have a running server accessible at `http://localhost:4001/trpc` 🎉
