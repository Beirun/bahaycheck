import { NextRequest, NextResponse } from "next/server";
import { jwtDecrypt, jwtVerify } from "jose";

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
  const token = authHeader.split(" ")[1];
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
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
    const {payload} = await jwtVerify(token, SECRET_KEY);

    return {role: payload.role as string}
  } catch {
    return {
      error: NextResponse.redirect(new URL("/signin", req.url)) ,
    };
  }
}

