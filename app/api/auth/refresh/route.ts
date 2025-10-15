import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET in .env");

export async function GET(req: NextRequest) {
  try {
    const cookie = req.headers.get("cookie");
    if (!cookie)
      return NextResponse.json({ error: "No refresh token" }, { status: 400 });

    const match = cookie.match(/refreshToken=([^;]+)/);
    if (!match)
      return NextResponse.json({ error: "No refresh token found" }, { status: 400 });

    const refreshToken = match[1];

    let payload;
    try {
      payload = jwt.verify(refreshToken, JWT_SECRET) as jwt.JwtPayload;
    } catch {
      return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 403 });
    }

    const newAccessToken = jwt.sign(
      { userId: payload.userId },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    return NextResponse.json({
      message: "Access token refreshed",
      accessToken: newAccessToken,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
