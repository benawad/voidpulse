import { ClickHouseClient } from "@clickhouse/client";
import { __clickhouse_kafka_host__ } from "../constants/prod";

export const up = async (clickhouse: ClickHouseClient) => {
  await clickhouse.command({
    query: `
		CREATE TABLE events_queue (
			insert_id UUID,
			name String,
			ingested_at DateTime,
			time DateTime,
			distinct_id String,
			properties String,
			project_id UUID
	)
	ENGINE = Kafka
	SETTINGS kafka_broker_list = '${__clickhouse_kafka_host__}:9092',
				 kafka_topic_list = 'events',
				 kafka_group_name = 'events_consumer_group1',
				 kafka_format = 'JSONEachRow',
				 kafka_max_block_size = 1048576;
  `,
  });
  await clickhouse.command({
    query: `
		CREATE MATERIALIZED VIEW events_queue_mv TO events AS
SELECT *
FROM events_queue;
  `,
  });
};
