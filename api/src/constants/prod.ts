export const __prod__ = process.env.NODE_ENV === "production";
export const __cloud__ = process.env.CLOUD === "true";
export const __kafka_host__ = __prod__
  ? __cloud__
    ? process.env.CLOUD_KAFKA_HOST
    : "kafak"
  : "localhost";
