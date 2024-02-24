import express, { Express } from "express";
import { z } from "zod";
import { db } from "../../db";
import { SQL, sql } from "drizzle-orm";
import { checkApiKeyMiddleware } from "./middleware/checkApiKeyMiddleware";
import { kafkaProducer } from "../../kafka/kafka";
import { dateToClickhouseDateString } from "../../utils/dateToClickhouseDateString";
import { propsToTypes } from "../../utils/propsToTypes";

const bodySchema = z.object({
  distinct_id: z.string().min(1).max(255),
  properties_to_add: z.record(z.any()).optional(),
  properties_to_remove: z.array(z.string()).optional(),
});
type Body = z.infer<typeof bodySchema>;

export const addUpdatePeopleRoute = (app: Express) => {
  app.post(
    "/update-people",
    express.json(),
    checkApiKeyMiddleware(),
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

      if (!body.properties_to_add && !body.properties_to_remove) {
        res
          .json({
            ok: false,
            errors: ["You must provide properties to add or remove"],
          })
          .status(400);
        return;
      }
      if (
        body.properties_to_add &&
        Object.keys(body.properties_to_add).length === 0
      ) {
        res
          .json({ ok: false, errors: ["properties_to_add cannot be empty"] })
          .status(400);
        return;
      }

      const projectId = (req as any).project_id;

      const sqlChunks: SQL[] = [
        sql`
      INSERT INTO people (distinct_id, project_id, properties, created_at)
      VALUES (${body.distinct_id}, ${projectId}, ${
        body.properties_to_add || {}
      }, now())
      ON CONFLICT (distinct_id, project_id) DO UPDATE SET properties = `,
      ];

      // Update properties
      if (body.properties_to_add) {
        // @todo cache
        const propTypes = propsToTypes(body.properties_to_add);
        db.execute(sql`
        insert into people_prop_types (project_id, prop_types, updated_at)
        values (${projectId}, ${propTypes}, now())
        on conflict (project_id)
        do update set prop_types = people_prop_types.prop_types || ${propTypes}
        `);
        //
        sqlChunks.push(sql`(people.properties || ${body.properties_to_add})`);
      }

      // Remove properties
      if (body.properties_to_remove) {
        if (!body.properties_to_add) {
          sqlChunks.push(sql`people.properties`);
        }

        for (const prop of body.properties_to_remove) {
          sqlChunks.push(sql` - ${prop}`);
        }
      }

      sqlChunks.push(sql`returning *`);

      const {
        rows: [row],
      } = await db.execute(sql.join(sqlChunks));

      if (row) {
        await kafkaProducer.send({
          topic: "people",
          messages: [
            {
              value: JSON.stringify({
                ...row,
                ingested_at: dateToClickhouseDateString(new Date()),
              }),
            },
          ],
        });
      }

      res.json({ ok: true });
    }
  );
};
