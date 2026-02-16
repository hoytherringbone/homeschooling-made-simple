import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicRoutes = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];
const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  if (isApiAuthRoute) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const isLoggedIn = !!token;

  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    const dest = token.onboarded === false ? "/onboarding" : "/dashboard";
    return NextResponse.redirect(new URL(dest, nextUrl));
  }

  // Allow public routes
  if (isPublicRoute) return NextResponse.next();

  // Block unauthenticated users from protected routes
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Redirect unonboarded users to onboarding (except the onboarding page itself)
  if (token.onboarded === false && nextUrl.pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
