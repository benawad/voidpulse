"use client";
import { HeaderNav } from "./ui/HeaderNav";
import { DashboardView } from "./components/dashboard/DashboardView";
import { trpc } from "./utils/trpc";
import { DeleteBoardConfirmationModal } from "./components/dashboard/DeleteBoardConfirmationModal";
import { useState } from "react";

function Home() {
  return (
    <main className="page flex flex-col">
      <HeaderNav />
      <DashboardView />
      {/* <DeleteBoardConfirmationModal isOpen={true} /> */}
    </main>
  );
}

export default trpc.withTRPC(Home);
