"use client";
import localFont from "next/font/local";
import { InfoModal } from "./ui/charts/InfoModal";
import { HeaderNav } from "./ui/HeaderNav";
import { DashboardView } from "./ui/dashboard/DashboardView";

const myFont = localFont({ src: "./castledown-regular-trial.otf" });

export default function Home() {
  return (
    <main className="page flex-col">
      <HeaderNav />
      <InfoModal />
      <DashboardView />
    </main>
  );
}
