declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DOMAIN: string;
      FRONTEND_URL: string;
      REFRESH_TOKEN_SECRET: string;
      ACCESS_TOKEN_SECRET: string;
      CHATGPT_API_SECRET: string;
      MIXPANEL_API_SECRET: string;
      MASTERMIND_LICENSE_KEY: string;
      MISTRAL_API_SECRET: string;
      POSTMARK_API_KEY: string;
      FROM_EMAIL: string;
      CLOUD_CLICKHOUSE_URL: string;
      CLOUD_KAFKA_HOST: string;
      CLOUD_KAFKA_HOST_FOR_CLICKHOUSE: string;
      CLOUD: string;
      GROK_API_KEY: string;
      FB_ACCESS_TOKEN: string;
      FB_AD_ACCOUNT_ID: string;
    }
  }
}

export {}
