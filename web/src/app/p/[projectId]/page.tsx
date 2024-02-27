"use client";
import React from "react";
import { trpc } from "../../utils/trpc";
import { HeaderNav } from "../../ui/HeaderNav";
import { DashboardView } from "../../components/dashboard/DashboardView";

const ProjectPage: React.FC = ({}) => {
  return (
    <main className="h-screen bg-primary-900 flex flex-col">
      <HeaderNav />
      <DashboardView />
    </main>
  );
};

export default trpc.withTRPC(ProjectPage);
export const runtime = "edge";
