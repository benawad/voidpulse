declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      DOMAIN: string;
      FRONTEND_URL: string;
      REFRESH_TOKEN_SECRET: string;
      ACCESS_TOKEN_SECRET: string;
    }
  }
}

export {}
