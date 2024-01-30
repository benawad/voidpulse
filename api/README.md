## Getting Started

To begin, ensure that ClickHouse is running locally by following the steps outlined [here](https://clickhouse.com/docs/en/getting-started/quick-start#1-download-the-binary). Alternatively, add `CLICKHOUSE_HOST` in the `.env` file or provide it through other means for the cloud version.

Create a `voidpulse` database for ClickHouse, or specify your version through `CLICKHOUSE_DATABASE`.

Next, set up Postgres or provide the `DATABASE_URL` for the cloud version. An example of the connection URI is provided below, and more details can be found [here](https://node-postgres.com/features/connecting#connection-uri):

```bash
DATABASE_URL=postgresql://petvoidenjoyer:secretpassword@localhost:5432/petvoid
```

Additionally, specify `FRONTEND_URL` for CORS purposes. For the development version, set it to:

```bash
FRONTEND_URL=http://localhost:3000
```

Ensure that you've filled in all the other required environment variables. Here's an example of a complete `.env` file:

```bash
# Double-check with .env.example to ensure that all environment variables are set
DATABASE_URL=postgresql://petvoidenjoyer:secretpassword@localhost:5432/petvoid
DOMAIN=localhost
FRONTEND_URL=http://localhost:3000
REFRESH_TOKEN_SECRET=shhhhh
ACCESS_TOKEN_SECRET=shhhhh
```

Next, run migrations using the command:

```bash
pnpm dlx tsx src/migrate.ts
```

Finally, start the server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Now, you should have a running server accessible at `http://localhost:4000`.
