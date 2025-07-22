import { db } from "../../db";
import { projects } from "../../schema/projects";
import { eq } from "drizzle-orm";
import { Request, Response } from "express";
import {
  queryReport,
  reportInputSchema,
} from "../../utils/query-metric/queryReport";
import { z } from "zod";

// Express-style handler: (req, res)
export default async function handler(req: Request, res: Response) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const queryApiKey = req.query.queryApiKey || req.headers["x-query-api-key"];
  if (!queryApiKey || typeof queryApiKey !== "string") {
    return res.status(400).json({ error: "Missing queryApiKey" });
  }

  const project = await db.query.projects.findFirst({
    where: eq(projects.queryApiKey, queryApiKey),
  });

  if (!project) {
    return res
      .status(404)
      .json({ error: "Project not found for this queryApiKey" });
  }

  // Accept params from req.query only
  let input = req.query;
  input.projectId = project.id;
  input = coerceQueryParams(input);

  // Validate input using reportInputSchema
  const parseResult = reportInputSchema.safeParse(input);
  if (!parseResult.success) {
    return res
      .status(400)
      .json({ error: "Invalid input", details: parseResult.error.errors });
  }

  try {
    const data = await queryReport(parseResult.data);
    return res.status(200).json(data);
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
}

// Utility to coerce query params to expected types
function coerceQueryParams(query: any) {
  const out: any = { ...query };

  // Booleans
  if ("noCache" in out) out.noCache = out.noCache === "true";
  if ("isOverTime" in out) out.isOverTime = out.isOverTime === "true";

  // Number enums
  if ("reportType" in out) out.reportType = parseInt(out.reportType, 10);
  if ("chartType" in out) out.chartType = parseInt(out.chartType, 10);
  if ("timeRangeType" in out)
    out.timeRangeType = parseInt(out.timeRangeType, 10);
  if (
    "ltvType" in out &&
    out.ltvType !== undefined &&
    out.ltvType !== null &&
    out.ltvType !== ""
  )
    out.ltvType = parseInt(out.ltvType, 10);
  if (
    "ltvWindowType" in out &&
    out.ltvWindowType !== undefined &&
    out.ltvWindowType !== null &&
    out.ltvWindowType !== ""
  )
    out.ltvWindowType = parseInt(out.ltvWindowType, 10);
  if (
    "lineChartGroupByTimeType" in out &&
    out.lineChartGroupByTimeType !== undefined &&
    out.lineChartGroupByTimeType !== null &&
    out.lineChartGroupByTimeType !== ""
  )
    out.lineChartGroupByTimeType = parseInt(out.lineChartGroupByTimeType, 10);

  // Arrays (expecting JSON-encoded arrays)
  if (typeof out.globalFilters === "string") {
    try {
      out.globalFilters = JSON.parse(out.globalFilters);
    } catch {
      out.globalFilters = [];
    }
  }
  if (typeof out.breakdowns === "string") {
    try {
      out.breakdowns = JSON.parse(out.breakdowns);
    } catch {
      out.breakdowns = [];
    }
  }
  if (typeof out.metrics === "string") {
    try {
      out.metrics = JSON.parse(out.metrics);
    } catch {
      out.metrics = [];
    }
  }
  if (typeof out.combinations === "string") {
    try {
      out.combinations = JSON.parse(out.combinations);
    } catch {
      out.combinations = undefined;
    }
  }

  return out;
}
