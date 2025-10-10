import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { code } from "@/schema/code";
import { and, eq, isNull } from "drizzle-orm";
import { user } from "@/schema/user";

export const POST = async (req: AuthRequest) => {
  try {
    const body = await req.json();
    const inputCode = body.code?.toString().trim();
    const phone = body.phone?.toString();

    if (!inputCode) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const record = await db
      .select()
      .from(user)
      .where(
          and(eq(user.userPhone, phone),isNull(user.dateDeleted))
        )
        .leftJoin(code, eq(user.userId, code.userId))
      .limit(1);

    if (!record[0]) {
      return NextResponse.json({ valid: false, message: "Code not found" }, { status: 404 });
    }

    const codeEntry = record[0];

    if (codeEntry.code!.isUsed) {
      return NextResponse.json({ valid: false, message: "Code has already been used" }, { status: 400 });
    }

    if (codeEntry.code!.expiresAt && new Date(codeEntry.code!.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, message: "Code has expired" }, { status: 400 });
    }

    // Mark code as used
    await db.update(code).set({ isUsed: true }).where(eq(code.codeId, codeEntry.code!.codeId));

    await db.update(user).set({isVerified: true}).where(eq(user.userId,codeEntry.user.userId))
    return NextResponse.json({ valid: true, message: "Code verified successfully" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
