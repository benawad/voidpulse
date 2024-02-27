import * as trpcExpress from "@trpc/server/adapters/express";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { __prod__ } from "./constants/prod";
import { sendMsgToAi } from "./routes/ai-messages/sendMsgToAi";
import { textToChart } from "./routes/ai-messages/textToChart";
import { getMe } from "./routes/auth/getMe";
import { login } from "./routes/auth/login";
import { register } from "./routes/auth/register";
import {
  createBoard,
  deleteBoard,
  getBoards,
  updateBoard,
  updateBoardOrder,
} from "./routes/boards/board-crud";
import { createProject } from "./routes/projects/createProject";
import { updateProject } from "./routes/projects/updateProject";
import { createChart } from "./routes/charts/createChart";
import { deleteChart } from "./routes/charts/deleteChart";
import { getCharts } from "./routes/charts/getCharts";
import { getEventNames } from "./routes/charts/getEventNames";
import { getPropKeys } from "./routes/charts/getPropKeys";
import { getPropValues } from "./routes/charts/getPropValues";
import { getReport } from "./routes/charts/insight/getReport";
import { updateChart } from "./routes/charts/updateChart";
import { createContext, t } from "./trpc";
import { confirmEmail } from "./routes/auth/confirmEmail";
import { logout } from "./routes/auth/logout";
import { forgotPassword } from "./routes/auth/forgotPassword";
import { acceptProjectInvite } from "./routes/projects/acceptProjectInvite";
import { sendProjectInvite } from "./routes/projects/sendProjectInvite";
import { setPassword } from "./routes/auth/setPassword";

export const appRouter = t.router({
  getBoards,
  getEventNames,
  getMe,
  register,
  login,
  updateBoard,
  createBoard,
  deleteBoard,
  getReport,
  getPropValues,
  getPropKeys,
  createChart,
  getCharts,
  updateChart,
  // updateMe,
  sendMsgToAi,
  textToChart,
  deleteChart,
  updateBoardOrder,
  updateProject,
  createProject,
  confirmEmail,
  logout,
  setPassword,
  forgotPassword,
  acceptProjectInvite,
  sendProjectInvite,
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

export type AppRouter = typeof appRouter;
