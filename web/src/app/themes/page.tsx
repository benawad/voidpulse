"use client";
import { trpc } from "../utils/trpc";

function Page() {
  return (
    <div className="page">
      Themes
      <div>Select a theme</div>
    </div>
  );
}
export default trpc.withTRPC(Page);
