import { ClickHouseClient } from "@clickhouse/client";

export const up = async (clickhouse: ClickHouseClient) => {
  await clickhouse.command({
    query: `
    CREATE TABLE events (
        id UUID DEFAULT generateUUIDv4(),
        insert_id UUID,
        name LowCardinality(String),
        created_at DateTime,
        properties JSON,
        distinct_id String,
        project_id String
    )
    ENGINE = MergeTree()
    PARTITION BY toYYYYMMDD(created_at)
    ORDER BY (created_at, name, distinct_id)
    SETTINGS index_granularity = 8192;
  `,
  });
};
