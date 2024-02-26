"use client";
import { LandingPage } from "./landing/LandingPage";
import { trpc } from "./utils/trpc";

export default trpc.withTRPC(LandingPage);
