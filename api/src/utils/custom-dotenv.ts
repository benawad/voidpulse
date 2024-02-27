import "dotenv/config";

const requiredEnvVars = [
  "DOMAIN",
  "FRONTEND_URL",
  "REFRESH_TOKEN_SECRET",
  "ACCESS_TOKEN_SECRET",
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length) {
  throw new Error(
    `Missing environment variables: ${missingEnvVars.join(", ")}`
  );
}

const requiredEnvVarsCloud = [
  "POSTMARK_API_KEY",
  "FROM_EMAIL",
  "CLOUD_KAFKA_HOST",
  "CLOUD_KAFKA_HOST_FOR_CLICKHOUSE",
  "CLOUD_CLICKHOUSE_URL",
];

const missingEnvVarsCloud = requiredEnvVarsCloud.filter(
  (envVar) => !process.env[envVar]
);

if (process.env.CLOUD === "true" && missingEnvVarsCloud.length) {
  throw new Error(
    `Missing environment variables for cloud: ${missingEnvVarsCloud.join(", ")}`
  );
}
