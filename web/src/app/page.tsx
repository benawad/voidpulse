"use client";
import { HeaderNav } from "./ui/HeaderNav";
import { InfoModal } from "./ui/charts/InfoModal";
import { DashboardView } from "./ui/dashboard/DashboardView";
import { trpc } from "./utils/trpc";

function Home() {
  return (
    <main className="page flex-col">
      <HeaderNav />
      <InfoModal />
      <DashboardView />
    </main>
  );
}

export default trpc.withTRPC(Home);
