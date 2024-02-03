import express, { Express } from "express";
import { z } from "zod";
import { kafkaProducer } from "../../kafka/kafka";
import { v4 } from "uuid";
import { dateInputRegex } from "../../constants/regex";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { projects } from "../../schema/projects";
import { dateToClickhouseDateString } from "../../utils/dateToClickhouseDateString";
import { checkApiKeyMiddleware } from "./middleware/checkApiKeyMiddleware";

const eventSchema = z.object({
  name: z.string().min(1).max(255),
  insert_id: z.string().uuid(),
  created_at: z.string().regex(dateInputRegex),
  distinct_id: z.string().min(1).max(255),
  properties: z.record(z.any()),
});

const bodySchema = z.object({
  events: z.array(eventSchema),
});

type Body = z.infer<typeof bodySchema>;

// 1mb - approx
const maxPropsSize = 1048576;

export const addIngestRoute = (app: Express) => {
  app.post(
    "/ingest",
    express.json({
      limit: "100mb",
    }),
    checkApiKeyMiddleware,
    async (req, res) => {
      let body: Body;
      try {
        body = await bodySchema.parseAsync(req.body);
      } catch (e) {
        res
          .json({
            ok: false,
            errors: e.errors,
          })
          .status(400);
        return;
      }

      // middlware adds this
      const project_id = (req as any).project_id;
      const messages: Array<{ value: string }> = [];
      const warnings: Array<string> = [];
      const ingest_at = dateToClickhouseDateString(new Date());
      for (const { properties, ...event } of body.events) {
        const str_props = JSON.stringify(properties);
        if (str_props.length > maxPropsSize) {
          warnings.push(
            `Event ${event.name} has properties that are too large: ${
              str_props.length
            } bytes and max size is ${maxPropsSize.toLocaleString()}. Event has been dropped.`
          );
          continue;
        }
        messages.push({
          value: JSON.stringify({
            id: v4(),
            project_id,
            ingest_at,
            properties: str_props,
            ...event,
          }),
        });
      }

      await kafkaProducer.send({
        topic: "events",
        messages,
      });

      const resp: any = {
        ok: true,
      };

      if (warnings.length) {
        resp.warnings = warnings;
      }

      res.json(resp);
    }
  );
};
