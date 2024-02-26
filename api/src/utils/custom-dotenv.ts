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
