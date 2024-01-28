import { ClickHouseClient } from "@clickhouse/client";

export const up = async (clickhouse: ClickHouseClient) => {
  await clickhouse.command({
    query: `
    CREATE TABLE events (
        id UUID,
        name LowCardinality(String),
        createdAt DateTime,
        properties JSON,
        distinctId String,
        projectId String
    )
    ENGINE = MergeTree()
    PARTITION BY toYYYYMMDD(createdAt)
    ORDER BY (createdAt, name, distinctId)
    SETTINGS index_granularity = 8192;
  `,
  });
};
