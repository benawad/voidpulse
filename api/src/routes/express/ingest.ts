import express, { Express } from "express";
import { z } from "zod";
import { kafkaProducer } from "../../kafka/kafka";
import { v4 } from "uuid";
import { dateInputRegex } from "../../constants/regex";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { projects } from "../../schema/projects";

const eventSchema = z.object({
  name: z.string().min(1).max(255),
  insert_id: z.string().uuid(),
  created_at: z.string().regex(dateInputRegex),
  distinct_id: z.string().min(1).max(255),
  properties: z.record(z.any()),
});

const bodySchema = z.object({
  api_key: z.string().regex(/^vp_[0-9a-f]{32}$/),
  events: z.array(eventSchema),
});

type Body = z.infer<typeof bodySchema>;

// 1mb - approx
const maxPropsSize = 1048576;

const apiKeyCache: Record<string, string> = {};

export const addIngestRoute = (app: Express) => {
  app.post(
    "/ingest",
    express.json({
      limit: "100mb",
    }),
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
      if (!(body.api_key in apiKeyCache)) {
        const project = await db.query.projects.findFirst({
          where: eq(projects.apiKey, body.api_key),
        });
        if (!project) {
          res
            .json({
              ok: false,
              errors: ["Invalid api key"],
            })
            .status(401);
          return;
        }
        apiKeyCache[body.api_key] = project.id;
      }
      const project_id = apiKeyCache[body.api_key];
      const messages: Array<{ value: string }> = [];
      const warnings: Array<string> = [];
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
            sign: -1,
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
