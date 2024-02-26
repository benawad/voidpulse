"use client";
import { redirect, usePathname } from "next/navigation";
import { trpc } from "./utils/trpc";
import { CurrThemeProvider } from "./themes/CurrThemeProvider";
import { LoadingSpinner } from "./ui/LoadingSpinner";

const publicPaths = ["/", "/check-email"];
const publicPathsStartWiths = ["/confirm-email/"];

function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPath =
    publicPaths.includes(pathname) ||
    publicPathsStartWiths.some((p) => pathname.startsWith(p));
  const { data, isLoading } = trpc.getMe.useQuery(undefined, {
    enabled: !isPublicPath,
  });

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-primary-900 flex justify-center items-center">
        <LoadingSpinner size={50} />
      </div>
    );
  }

  if (
    !publicPaths &&
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
