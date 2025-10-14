import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/db/drizzle";
import { user } from "@/schema/user";
import { and, eq, isNull } from "drizzle-orm";
import { role } from "@/schema/role";

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET in .env");

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();
    if (!phone || !password)
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });

    const result = await db
      .select()
      .from(user)
      .where(and(eq(user.phoneNumber, phone), isNull(user.dateDeleted)))
      .leftJoin(role, eq(user.roleId,role.roleId))
      .limit(1);

    if (!result.length)
      return NextResponse.json({ error: "Invalid phone number" }, { status: 401 });

    const u = result[0];
    const valid = await bcryptjs.compare(password, u.user.passwordHash);
    if (!valid)
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: u.user.userId, role: u.role?.roleName, phone: u.user.phoneNumber },
      JWT_SECRET,
      { expiresIn: "1m" }
    );
    const refreshToken = jwt.sign(
      { userId: u.user.userId },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Create response and attach refresh token cookie
    const res = NextResponse.json({
      message: "Signed in successful",
      accessToken,
      user: { userId: u.user.userId, firstName: u.user.firstName, lastName: u.user.lastName ,phoneNumber: u.user.phoneNumber },
    });

    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
