"use client";
import { DashboardView } from "./components/dashboard/DashboardView";
import { HeaderNav } from "./ui/HeaderNav";
import { trpc } from "./utils/trpc";

function Home() {
  return (
    <main className="h-screen bg-primary-900 flex flex-col">
      <HeaderNav />
      <DashboardView />
    </main>
  );
}

export default trpc.withTRPC(Home);
