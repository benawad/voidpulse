import { ClickHouseClient } from "@clickhouse/client";

export const up = async (clickhouse: ClickHouseClient) => {
  await clickhouse.command({
    query: `
    CREATE TABLE events (
        id UUID DEFAULT generateUUIDv4(),
        insert_id UUID,
        name String,
        created_at DateTime,
        distinct_id String,
        properties String,
        project_id UUID,
        sign Int8
    )
    ENGINE = CollapsingMergeTree(sign)
    PARTITION BY toYYYYMMDD(created_at)
    ORDER BY (project_id, name, insert_id, created_at)
    SETTINGS index_granularity = 8192;
  `,
  });
};
