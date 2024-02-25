declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      DOMAIN: string;
      FRONTEND_URL: string;
      REFRESH_TOKEN_SECRET: string;
      ACCESS_TOKEN_SECRET: string;
      CHATGPT_API_SECRET: string;
      MIXPANEL_API_SECRET: string;
      MASTERMIND_LICENSE_KEY: string;
      MISTRAL_API_SECRET: string;
    }
  }
}

export {}
