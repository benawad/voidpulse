"use client";
import Image from "next/image";
import localFont from "next/font/local";
import { ChartThumbnail } from "./ui/Dashboards/ChartThumbnail";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ChartViewPage } from "./ui/Dashboards/ChartViewPage";
import { InfoModal } from "./ui/Charts/InfoModal";
import { HeaderNav } from "./ui/HeaderNav";
import { DashboardView } from "./ui/Dashboards/DashboardView";

const myFont = localFont({ src: "./castledown-regular-trial.otf" });

export default function Home() {
  return (
    <main className="bg-primary-900 flex min-h-screen flex-col items-center overscroll-none py-16">
      <HeaderNav />
      <InfoModal />
      <ChartViewPage />
      <DashboardView />
    </main>
  );
}
