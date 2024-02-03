import { eq } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import { db } from "../../../db";
import { projects } from "../../../schema/projects";

const apiKeyCache: Record<string, string> = {};

const apiKeyRegex = /^vp_[0-9a-f]{32}$/;

export const checkApiKeyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers["x-api-key"] as string | undefined;

  if (typeof apiKey !== "string" || !apiKey || !apiKeyRegex.test(apiKey)) {
    return res.status(401).json({ ok: false, errors: ["Invalid api key"] });
  }

  if (!(apiKey in apiKeyCache)) {
    const project = await db.query.projects.findFirst({
      where: eq(projects.apiKey, apiKey),
    });
    if (!project) {
      return res
        .json({
          ok: false,
          errors: ["Invalid api key"],
        })
        .status(401);
    }
    apiKeyCache[apiKey] = project.id;
  }
  (req as any).project_id = apiKeyCache[apiKey];

  return next();
};
