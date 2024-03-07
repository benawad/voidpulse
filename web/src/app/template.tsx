"use client";
import { redirect, usePathname } from "next/navigation";
import { CurrThemeProvider } from "./themes/CurrThemeProvider";
import { FullScreenLoading } from "./ui/FullScreenLoading";
import { trpc } from "./utils/trpc";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  useEffect(() => {
    if (
      !isPublicPath &&
      !isLoading &&
      !data?.user &&
      pathname !== "/login" &&
      pathname !== "/register"
    ) {
      redirect("/login");
    }
  }, [pathname, isLoading]);

  useEffect(() => {
    if (data?.user && (pathname === "/login" || pathname === "/register")) {
      redirect(`/p/${data.projects[0].id}`);
    }
  }, [pathname, isLoading]);

  if (isLoading) {
    return <FullScreenLoading />;
  }

  return (
    <CurrThemeProvider>
      {children}
      <ToastContainer />
    </CurrThemeProvider>
  );
}

export default trpc.withTRPC(Template);
