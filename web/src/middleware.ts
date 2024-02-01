import { NextResponse, NextRequest } from "next/server";
import { trpcServer } from "./app/utils/trpc";

export async function middleware(request: NextRequest) {
  let { user } = await trpcServer.getMe.query();
  const authenticated = user !== null;

  // If the user is authenticated, continue as normal
  if (authenticated) {
    return NextResponse.next();
  }

  // Redirect to login page if not authenticated
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/", "/chart/:path*", "/assistant/:path*", "/themes/:path*"],
};
