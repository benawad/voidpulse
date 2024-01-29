"use client";
import React from "react";
import { ChartEditor } from "../ui/dashboard/ChartEditor";
import Link from "next/link";
import { HeaderNav } from "../ui/HeaderNav";

interface pageProps {}

export default function Page() {
  return (
    <div className="page">
      <HeaderNav />
      <ChartEditor></ChartEditor>
    </div>
  );
}
