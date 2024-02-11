"use client";
import { redirect, usePathname } from "next/navigation";
import { trpc } from "./utils/trpc";
import { CurrThemeProvider } from "./themes/CurrThemeProvider";

function Template({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = trpc.getMe.useQuery();
  let pathname = usePathname();

  if (isLoading) {
    return null;
  }

  if (!data?.user && pathname !== "/login" && pathname !== "/register") {
    redirect("/login");
  }

  return <CurrThemeProvider>{children}</CurrThemeProvider>;
}

export default trpc.withTRPC(Template);
