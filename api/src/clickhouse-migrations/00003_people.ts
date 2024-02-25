import { ClickHouseClient } from "@clickhouse/client";
import { __prod__ } from "../constants/prod";

export const up = async (clickhouse: ClickHouseClient) => {
  await clickhouse.command({
    query: `
    CREATE TABLE people (
        created_at DateTime,
        distinct_id String,
        properties String,
        project_id UUID,
        ingested_at DateTime
    )
    ENGINE = ReplacingMergeTree(ingested_at)
    PARTITION BY toYYYYMMDD(created_at)
    ORDER BY (project_id, distinct_id, created_at)
    SETTINGS index_granularity = 8192;
  `,
  });
  await clickhouse.command({
    query: `
		CREATE TABLE people_queue (
      created_at DateTime,
      distinct_id String,
      properties String,
      project_id UUID,
      ingested_at DateTime
	)
	ENGINE = Kafka
	SETTINGS kafka_broker_list = '${__prod__ ? "kafka" : "localhost"}:9092',
				 kafka_topic_list = 'people',
				 kafka_group_name = 'people_consumer_group1',
				 kafka_format = 'JSONEachRow',
				 kafka_max_block_size = 1048576;
  `,
  });
  await clickhouse.command({
    query: `
		CREATE MATERIALIZED VIEW people_queue_mv TO people AS
SELECT *
FROM people_queue;
  `,
  });
};
