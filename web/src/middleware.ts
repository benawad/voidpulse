import { NextResponse, NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let user = await fetch("http://localhost:4000/trpc/getMe", {
    headers: request.headers,
  })
    .then((res) => res.json())
    .then((res) => res.result?.data?.user);
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
