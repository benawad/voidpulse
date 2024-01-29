import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";
import cookieParser from "cookie-parser";
import { createContext, t } from "./trpc";
import {
  getBoards,
  updateBoard,
  createBoard,
  deleteBoard,
} from "./routes/main/boards";
import { getChartData } from "./routes/main/chart-builder";

const appRouter = t.router({
  getBoards,
  updateBoard,
  createBoard,
  deleteBoard,
  getChartData,
});

export const app = express();
app.use(
  "/trpc",
  cookieParser(),
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);
