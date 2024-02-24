import express, { Express } from "express";
import geoip from "geoip-lite";
import { v4 } from "uuid";
import { z } from "zod";
import { dateInputRegex } from "../../constants/regex";
import { kafkaProducer } from "../../kafka/kafka";
import { dateToClickhouseDateString } from "../../utils/dateToClickhouseDateString";
import { checkApiKeyMiddleware } from "./middleware/checkApiKeyMiddleware";

const eventSchema = z.object({
  name: z.string().min(1).max(255),
  insert_id: z.string().uuid(),
  time: z.string().regex(dateInputRegex),
  distinct_id: z.string().min(1).max(255),
  properties: z.record(z.any()),
  ip: z.string().optional(),
});

const bodySchema = z.object({
  skipIpLookup: z.boolean().optional(),
  events: z.array(eventSchema),
});

type Body = z.infer<typeof bodySchema>;

// 1mb - approx
const maxPropsSize = 1048576;

export const addIngestRoute = (app: Express) => {
  app.set("trust proxy", true);
  app.post(
    "/ingest",
    express.json({
      limit: "100mb",
    }),
    checkApiKeyMiddleware(),
    async (req, res) => {
      let body: Body;
      try {
        body = await bodySchema.parseAsync(req.body);
      } catch (e) {
        res.status(400).json({
          ok: false,
          errors: e.errors,
        });
        return;
      }

      // middlware adds this
      const project_id = (req as any).project_id;
      const messages: Array<{ value: string }> = [];
      const warnings: Array<string> = [];
      const ingest_at = dateToClickhouseDateString(new Date());
      let geoInfo: {
        city: string;
        country: string;
        region: string;
        timezone: string;
      } | null = null;
      if (!body.skipIpLookup && req.ip) {
        geoInfo = geoip.lookup(req.ip);
      }

      for (const { properties, ip, ...event } of body.events) {
        if (!body.skipIpLookup && ip) {
          geoInfo = geoip.lookup(ip);
        }
        if (geoInfo) {
          properties.$city = geoInfo.city;
          properties.$country = geoInfo.country;
          properties.$region = geoInfo.region;
          properties.$timezone = geoInfo.timezone;
        }
        properties.distinct_id = event.distinct_id;
        properties.time = event.time;
        properties.$insert_id = event.insert_id;
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
