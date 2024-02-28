"use client";
import { redirect, usePathname } from "next/navigation";
import { CurrThemeProvider } from "./themes/CurrThemeProvider";
import { FullScreenLoading } from "./ui/FullScreenLoading";
import { trpc } from "./utils/trpc";

const publicPaths = ["/", "/check-email", "/forgot-password"];
const publicPathsStartWiths = [
  "/confirm-email/",
  "/accept-invite/",
  "/set-password/",
];

function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPath =
    publicPaths.includes(pathname) ||
    publicPathsStartWiths.some((p) => pathname.startsWith(p));
  const { data, isLoading } = trpc.getMe.useQuery(undefined, {
    enabled: !isPublicPath,
  });

  if (isLoading) {
    return <FullScreenLoading />;
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
