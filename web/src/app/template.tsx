"use client"
import { redirect, usePathname } from "next/navigation";
import { trpc } from "./utils/trpc";

function Template({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = trpc.getMe.useQuery();
  let pathname = usePathname();

  if (isLoading) {
    return null;
  }

  if (!data?.user && pathname !== "/login") {
    redirect("/login")
  }

  return children;
}

export default trpc.withTRPC(Template);
