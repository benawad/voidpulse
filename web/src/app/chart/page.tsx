"use client";
import { HeaderNav } from "../ui/HeaderNav";
import { ChartEditor } from "../ui/dashboard/ChartEditor";

export default function Page() {
  return (
    <div className="page">
      <HeaderNav />
      <ChartEditor />
    </div>
  );
}
