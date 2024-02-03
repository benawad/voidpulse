import { ClickHouseClient } from "@clickhouse/client";

export const up = async (clickhouse: ClickHouseClient) => {
  await clickhouse.command({
    query: `
    CREATE TABLE events (
        insert_id UUID,
        name String,
        ingested_at DateTime,
        time DateTime,
        distinct_id String,
        properties String,
        project_id UUID
    )
    ENGINE = ReplacingMergeTree(ingested_at)
    PARTITION BY toYYYYMMDD(time)
    ORDER BY (project_id, name, insert_id, time)
    SETTINGS index_granularity = 8192;
  `,
  });
};
