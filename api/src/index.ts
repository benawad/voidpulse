import "dotenv-safe/config";
import express from "express";
import z from "zod";
import { app } from "./appRouter";
import { clickhouse, runClickhouseMigrations } from "./clickhouse";
import { dateInputRegex } from "./constants/regex";
import { reservedPropKeys } from "./constants/reserved-keys";
import { kafkaProducer } from "./kafka/kafka";
import { v4 } from "uuid";

const eventSchema = z.object({
  name: z.string(),
  insert_id: z.string(),
  created_at: z.string().regex(dateInputRegex),
  distinct_id: z.string(),
  api_key: z.string(),
  properties: z.record(z.any()).refine(
    (obj) => {
      // Get all keys from the object
      const keys = Object.keys(obj);
      // Check if any key is forbidden
      return !keys.some((key) => reservedPropKeys.includes(key));
    },
    {
      // Custom error message
      message: `Cannot use reserved keys: https://docs.mixpanel.com/docs/data-structure/events-and-properties#reserved-event-properties"
      )}`,
    }
  ),
});

type Event = z.infer<typeof eventSchema>;

const startServer = async () => {
  await runClickhouseMigrations();
  await kafkaProducer.connect();
  app.post("/ingest", express.json(), async (req, res) => {
    // @todo validation https://docs.mixpanel.com/docs/data-structure/property-reference#supported-data-types
    let event: Event;
    try {
      event = await eventSchema.parseAsync(req.body);
    } catch (e) {
      res.json({
        ok: false,
        errors: e.errors,
      });
      return;
    }

    await kafkaProducer.send({
      topic: "events",
      messages: [
        {
          value: JSON.stringify({
            id: v4(),
            project_id: v4(),
            sign: 1,
            ...event,
          }),
        },
      ],
    });

    res.json({
      ok: true,
    });
  });

  app.listen(4000, () => {
    console.log("server started on http://localhost:4000/trpc");
  });
};

startServer();
