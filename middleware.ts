import { NextResponse } from "next/server";
import { authenticateToken } from "@/utils/auth";
export async function middleware(req: AuthRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api/admin")) {
    await authenticateToken(req);
    if (req.user.role.toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/volunteer")) {
    await authenticateToken(req);
    if (req.user.role.toLowerCase() !== "volunteer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/user")) {
    await authenticateToken(req);
    if (req.user.role.toLowerCase() !== "user") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.next();
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/api/admin/:path*", "/api/volunteer/:path*", "/api/user/:path*"],
};
