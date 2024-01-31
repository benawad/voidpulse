"use client";
import { useRouter } from "next/navigation";
import { HeaderNav } from "./ui/HeaderNav";
import { DashboardView } from "./ui/dashboard/DashboardView";
import { trpc } from "./utils/trpc";
import { DeleteBoardConfirmationModal } from "./components/DeleteBoardConfirmationModal";
import { useState } from "react";

function Home() {
  const { data, isLoading } = trpc.getMe.useQuery();
  let router = useRouter();

  if (isLoading) {
    return null;
  }

  if (!data?.user) {
    router.push("/register");
  }

  return (
    <main className="page flex flex-col">
      <HeaderNav />
      <DashboardView />
      {/* <DeleteBoardConfirmationModal isOpen={true} /> */}
    </main>
  );
}

export default trpc.withTRPC(Home);
