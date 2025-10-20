import { NextRequest, NextResponse } from "next/server";
import { authenticateToken, isAuthenticated } from "@/utils/auth";
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authenticatedRoutes = ["/api/admin", "/api/user", "/api/volunteer","/api/notification"];
  const authenticatePages = ["/admin", "/user", "/volunteer","/account"];

  if (authenticatePages.some((route) => pathname.startsWith(route))) {
    const { error } = await isAuthenticated(req);
    if(error) return error;
  }

  if (authenticatedRoutes.some((route) => pathname.startsWith(route))) {
    const payload = await authenticateToken(req);
    if (payload.error)  return payload.error;
    
    const role = payload.role;
    if (pathname.startsWith("/api/admin")) {
      if (role.toLowerCase() !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.next();
    }
    if (pathname.startsWith("/api/volunteer")) {
      if (role.toLowerCase() !== "volunteer") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.next();
    }
    if (pathname.startsWith("/api/user")) {
      if (role.toLowerCase() !== "user") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.next();
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/api/:path*", "/:path*"], // Apply to all API routes and other paths, excluding static assets
};
