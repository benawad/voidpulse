"use client";
import { redirect, usePathname } from "next/navigation";
import { trpc } from "./utils/trpc";
import { CurrThemeProvider } from "./themes/CurrThemeProvider";
import { LoadingSpinner } from "./ui/LoadingSpinner";

function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data, isLoading } = trpc.getMe.useQuery(undefined, {
    enabled: pathname !== "/", // don't fetch user if we're on the landing page
  });

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-primary-900 flex justify-center items-center">
        <LoadingSpinner size={50} />
      </div>
    );
  }

  if (
    pathname !== "/" &&
    !data?.user &&
    pathname !== "/login" &&
    pathname !== "/register"
  ) {
    redirect("/login");
  }

  if (data?.user && (pathname === "/login" || pathname === "/register")) {
    redirect(`/p/${data.projects[0].id}`);
  }

  return <CurrThemeProvider>{children}</CurrThemeProvider>;
}

export default trpc.withTRPC(Template);
