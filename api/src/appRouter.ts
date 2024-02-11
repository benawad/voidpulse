import * as trpcExpress from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import { createContext, t } from "./trpc";
import {
  getBoards,
  updateBoard,
  createBoard,
  deleteBoard,
} from "./routes/boards/board-crud";
import { getReport } from "./routes/charts/insight/getReport";
import { login } from "./routes/auth/login";
import { __prod__ } from "./constants/prod";
import { register } from "./routes/auth/register";
import { getMe } from "./routes/auth/getMe";
import { getEventNames } from "./routes/charts/getEventNames";
import { getProjects } from "./routes/boards/getProjects";
import { getPropValues } from "./routes/charts/getPropValues";
import { getPropKeys } from "./routes/charts/getPropKeys";
import { createChart } from "./routes/charts/createChart";
import { getCharts } from "./routes/charts/getCharts";
import { updateChart } from "./routes/charts/updateChart";
import { updateMe } from "./routes/auth/updateMe";

export const appRouter = t.router({
  getProjects,
  getEventNames,
  getMe,
  register,
  login,
  getBoards,
  updateBoard,
  createBoard,
  deleteBoard,
  getReport,
  getPropValues,
  getPropKeys,
  createChart,
  getCharts,
  updateChart,
  updateMe,
});

export const app = express();
app.use(
  "/trpc",
  cors({
    maxAge: __prod__ ? 86400 : undefined,
    credentials: true,
    origin: process.env.FRONTEND_URL,
  }),
  cookieParser(),
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
    onError(opts) {
      const { error, type, path, input, ctx, req } = opts;
      console.error("Error:", error);
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.log("Internal server error");
        // send to bug reporting
      }
    },
  })
);
