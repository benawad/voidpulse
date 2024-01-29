"use client";
import localFont from "next/font/local";
import { InfoModal } from "./ui/charts/InfoModal";
import { HeaderNav } from "./ui/HeaderNav";
import { DashboardView } from "./ui/dashboard/DashboardView";

const myFont = localFont({ src: "./castledown-regular-trial.otf" });

export default function Home() {
  return (
    <main className="bg-primary-900 flex min-h-screen flex-col items-center overscroll-none py-16">
      <HeaderNav />
      <InfoModal />
      <DashboardView />
    </main>
  );
}
