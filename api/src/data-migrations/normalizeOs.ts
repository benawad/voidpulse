import { ClickHouseQueryResponse, clickhouse } from "../clickhouse";
import { kafkaProducer } from "../kafka/kafka";
import { dateToClickhouseDateString } from "../utils/dateToClickhouseDateString";

type Row = {
  insert_id: string; // UUID is a string in TypeScript
  name: string;
  ingested_at: string; // DateTime is represented as Date in TypeScript
  time: string; // DateTime is represented as Date in TypeScript
  distinct_id: string;
  properties: string; // Assuming JSON stored as a string, otherwise could be an object
  project_id: string; // UUID is a string in TypeScript
};

export const normalizeOsDataMigration = async () => {
  console.log("Running normalizeOsDataMigration");
  const res = await clickhouse.query({
    query: `
	select *
	from events
	WHERE JSONExtractString(properties, '$os') NOT IN ('iOS', 'iPadOS', 'Android', 'Windows', 'Web');
	`,
    format: "JSONEachRow",
  });
  const stream = res.stream();
  let promises: Promise<any>[] = [];
  stream.on("data", (rows: any) => {
    const messages: Array<{ value: string }> = [];
    rows.forEach((row: any) => {
      const d = row.json() as Row;
      messages.push({
        value: JSON.stringify({
          ...d,
          ingested_at: dateToClickhouseDateString(new Date()),
          properties: JSON.stringify({
            ...JSON.parse(d.properties),
            $os: "Android",
          }),
        }),
      });
    });
    promises.push(
      kafkaProducer.send({
        topic: "events",
        messages,
      })
    );
  });
  await new Promise((resolve) => {
    stream.on("end", () => {
      console.log("stream complete");
      resolve(0);
    });
  });
  await Promise.all(promises);
  console.log("sent to kafka");
  console.log("done");
};
