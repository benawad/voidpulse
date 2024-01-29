import { TRPCError, initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { verify } from "jsonwebtoken";
import {
  AccessTokenData,
  RefreshTokenData,
  sendAuthCookies,
} from "./utils/createAuthTokens";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users } from "./schema/users";
import {
  createBoard,
  deleteBoard,
  getBoards,
  updateBoard,
} from "./routes/main/boards";
import { getChartData } from "./routes/main/chart-builder";

// created for each request
export const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({ req, res, userId: "" }); // no context
type Context = Awaited<ReturnType<typeof createContext> & { userId: string }>;

export const t = initTRPC.context<Context>().create();
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;
  if (!ctx.req.cookies.id && !ctx.req.cookies.rid) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const { id, rid } = ctx.req.cookies;

  try {
    const data = <AccessTokenData>verify(id, process.env.ACCESS_TOKEN_SECRET);
    ctx.userId = data.userId;
    return opts.next(opts);
  } catch {}

  if (!rid) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  let data;
  try {
    data = <RefreshTokenData>verify(rid, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, data.userId),
  });
  if (!user || user.refreshTokenVersion !== data.refreshTokenVersion) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  ctx.userId = user.id;
  sendAuthCookies(ctx.res, user);

  return opts.next(opts);
});
