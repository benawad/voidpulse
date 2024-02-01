"use client";
import { trpc } from "../utils/trpc";

function Page() {
  return <div className="page">Hello</div>;
}
export default trpc.withTRPC(Page);
