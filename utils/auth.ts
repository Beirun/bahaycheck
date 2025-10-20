import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

interface Payload {
  role: string;
  userId: number;
  phone: string;
}

export async function authenticateToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 403 }),
    };
  }
  console.log("testt");
  const token = authHeader.split(" ")[1];
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    console.log("payload", payload);
    const { role, userId, phone } = payload as unknown as Payload;
    return { role, userId, phone };
  } catch (error) {
    const e = error as Error;
    return {
      error:
        e.name === "JWSInvalid"
          ? NextResponse.json({ error: "Invalid token" }, { status: 403 })
          : NextResponse.json({ error: "Session Expired" }, { status: 401 }),
    };
  }
}

export async function isAuthenticated(req: NextRequest) {
  try {
    const token = req.cookies.get("refreshToken")?.value;
    if (!token) return {error: NextResponse.redirect(new URL("/signin", req.url))};
    await jwtVerify(token, SECRET_KEY);
    return {success: NextResponse.next()}
  } catch {
    return {
      error: NextResponse.redirect(new URL("/signin", req.url)) ,
    };
  }
}
