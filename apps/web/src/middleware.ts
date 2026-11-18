import { NextResponse } from "next/server";

// The app does not use locale segments in its route tree. next-intl middleware
// rewrites internally to /<locale> even with localePrefix: "never", which
// would send these routes to a nonexistent /ja or /en page.
export default function middleware() {
  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except Next.js internals and static files
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)).*)",
  ],
};
