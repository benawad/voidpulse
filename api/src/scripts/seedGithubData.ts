import "dotenv-safe/config";
import * as axios from "axios";
import * as zlib from "zlib";
import * as fs from "fs";
import { db } from "../db";
import { projects } from "../schema/projects";
import { clickhouse } from "../clickhouse";
import { v5 } from "uuid";
import { dateToClickhouseDateString } from "../utils/dateToClickhouseDateString";

async function downloadAndUnzipFile(
  url: string,
  outputPath: string
): Promise<void> {
  if (fs.existsSync(outputPath.replace(".gz", ""))) {
    console.log("File already exists.");
    return;
  }

  const response = await axios.default.get(url, {
    responseType: "stream",
    headers: {
      "Accept-Encoding": "gzip",
    },
  });

  const writeStream = fs.createWriteStream(outputPath);
  response.data.pipe(writeStream);

  return new Promise<void>((resolve, reject) => {
    writeStream.on("finish", () => {
      fs.createReadStream(outputPath)
        .pipe(zlib.createGunzip())
        .pipe(fs.createWriteStream(outputPath.replace(".gz", "")))
        .on("finish", () => {
          resolve();
        })
        .on("error", (err) => {
          reject(err);
        });
    });

    writeStream.on("error", (err) => {
      reject(err);
    });
  });
}

async function readJSONRecords(filePath: string): Promise<any[]> {
  return new Promise<any[]>((resolve, reject) => {
    const jsonData: any[] = [];

    const readStream = fs.createReadStream(filePath.replace(".gz", ""));
    const rl = require("readline").createInterface({
      input: readStream,
      crlfDelay: Infinity,
    });

    rl.on("line", (line: string) => {
      try {
        const record = JSON.parse(line);
        jsonData.push(record);
      } catch (error) {
        reject(error);
      }
    });

    rl.on("close", () => {
      resolve(jsonData);
    });

    rl.on("error", (err: string) => {
      reject(err);
    });
  });
}

function flattenObject(obj: any, prefix: string = ""): any {
  return Object.keys(obj).reduce((acc: any, key: string): any => {
    const prefKey = prefix ? `${prefix}_${key}` : key;

    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      Object.assign(acc, flattenObject(obj[key], prefKey));
    } else {
      acc[prefKey] = obj[key];
    }

    return acc;
  }, {});
}

const loadEventsIntoClickhouse = async (events: any[]) => {
  const peopleMap: Record<string, any> = {};
  const [{ id: project_id }] = await db.select().from(projects);

  await clickhouse.insert({
    table: "events",
    values: events.map(({ id, type, actor, created_at, ...other }: any) => {
      peopleMap[actor.id] = actor;
      return {
        properties: JSON.stringify(flattenObject(other)),
        project_id,
        insert_id: v5("" + id, project_id),
        ingested_at: dateToClickhouseDateString(new Date()),
        name: type,
        distinct_id: actor.id,
        time: dateToClickhouseDateString(new Date(created_at)),
      };
    }),
    format: "JSONEachRow",
  });
  await clickhouse.insert({
    table: "people",
    values: Object.values(peopleMap).map(({ id, ...other }: any) => {
      return {
        properties: JSON.stringify(flattenObject(other)),
        project_id,
        insert_id: v5("" + id, project_id),
        ingested_at: dateToClickhouseDateString(new Date()),
        distinct_id: id,
        created_at: dateToClickhouseDateString(new Date()),
      };
    }),
    format: "JSONEachRow",
  });
};

async function main() {
  const url = "https://data.gharchive.org/2024-02-01-15.json.gz";
  const outputPath = "./data.json.gz";

  try {
    if (!fs.existsSync(outputPath.replace(".gz", ""))) {
      console.log("Downloading and unzipping file...");
      await downloadAndUnzipFile(url, outputPath);
      console.log("File downloaded and unzipped successfully.");
    } else {
      console.log("File already exists.");
    }

    console.log("Reading JSON records...");
    const jsonRecords = await readJSONRecords(outputPath);
    console.log(`${jsonRecords.length} JSON records found`);
    let page = 0;
    let pageSize = 50000;
    while (page * pageSize < jsonRecords.length) {
      await loadEventsIntoClickhouse(
        jsonRecords.slice(page * pageSize, (page + 1) * pageSize)
      );
      console.log(
        `${((page + 1) * pageSize).toLocaleString()} loaded into Clickhouse`
      );
      page++;
    }
    console.log("Events loaded into Clickhouse");
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
