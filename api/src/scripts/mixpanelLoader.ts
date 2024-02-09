import "dotenv-safe/config";
import fs from "fs";
import axios from "axios";
import { clickhouse } from "../clickhouse";
import readline from "readline";
import { v4, v5 } from "uuid";
import { db } from "../db";
import { projects } from "../schema/projects";
import { dateToClickhouseDateString } from "../utils/dateToClickhouseDateString";

const apiSecret = process.env.MIXPANEL_API_SECRET as string;
const params = new URLSearchParams({
  from_date: "2023-12-02",
  to_date: "2023-12-02",
  event: `["PlantUnlocked"]`,
});
const headers = {
  Authorization: `Basic ${Buffer.from(`${apiSecret}:`).toString("base64")}`,
};
const url = "https://data.mixpanel.com/api/2.0/export/";
const exportData = async () => {
  try {
    const [{ id }] = await db.select().from(projects);
    console.log("starting...");
    const response = await axios.get(url, {
      headers,
      params,
      responseType: "stream",
    });
    const rl = readline.createInterface({
      input: response.data,
      crlfDelay: Infinity, // Treat CR LF ('\r\n') as a single line break
    });

    let lineBuffer: string[] = [];
    const chunkSize = 100000;
    let i = 0;

    rl.on("line", (line) => {
      lineBuffer.push(line);
      if (lineBuffer.length === chunkSize) {
        i++;
        console.log("num items: ", i * chunkSize);
        processLines(lineBuffer, id);
        lineBuffer = [];
      }
    });

    rl.on("close", () => {
      if (lineBuffer.length > 0) {
        // Process any remaining lines in the buffer
        processLines(lineBuffer, id);
      }
      console.log("All lines processed successfully.");
    });

    // console.log("DONE");
  } catch (error) {
    console.error("Error:", error.message);
  }
};

const processLines = async (data: string[], project_id: string) => {
  const str = data.join(",");
  const d = JSON.parse(
    `[${str.endsWith(",") ? str.slice(0, str.length - 1) : str}]`
  );
  await clickhouse.insert({
    table: "events",
    values: d.map((x: any) => ({
      ...x,
      properties: JSON.stringify(x.properties),
      project_id,
      insert_id: v5(x.properties["$insert_id"], project_id),
      ingested_at: dateToClickhouseDateString(new Date()),
      name: x.event,
      distinct_id: x.properties.distinct_id,
      time: dateToClickhouseDateString(new Date(x.properties.time * 1000)),
    })),
    format: "JSONEachRow",
  });
};

exportData();
