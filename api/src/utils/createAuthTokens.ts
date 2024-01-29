import { sign, verify } from "jsonwebtoken";
import { DbUser, db } from "../db";
import { Response } from "express";
import { __prod__ } from "../constants/prod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { users } from "../schema/users";

export type RefreshTokenData = {
  userId: string;
  refreshTokenVersion?: number;
};

export type AccessTokenData = {
  userId: string;
};

const createAuthTokens = (
  user: DbUser
): { refreshToken: string; accessToken: string } => {
  const refreshToken = sign(
    { userId: user.id, refreshTokenVersion: user.refreshTokenVersion },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "30d",
    }
  );
  const accessToken = sign(
    { userId: user.id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15min",
    }
  );

  return { refreshToken, accessToken };
};

export const sendAuthCookies = (res: Response, user: DbUser) => {
  const { accessToken, refreshToken } = createAuthTokens(user);
  const opts = {
    path: "/",
    httpOnly: true,
    secure: __prod__,
    domain: __prod__ ? `.${process.env.DOMAIN}` : "",
    maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 year
  };
  res.cookie("id", accessToken, opts);
  res.cookie("rid", refreshToken, opts);
};

export const checkTokens = async (
  accessToken: string,
  refreshToken: string
) => {
  try {
    const data = <AccessTokenData>(
      verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
    );
    return {
      userId: data.userId,
    };
  } catch {}

  if (!refreshToken) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  let data;
  try {
    data = <RefreshTokenData>(
      verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    );
  } catch {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, data.userId),
  });
  if (!user || user.refreshTokenVersion !== data.refreshTokenVersion) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return {
    userId: data.userId,
    user,
  };
};
