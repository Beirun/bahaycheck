import {  NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { license } from "@/schema/license";
import { eq } from "drizzle-orm";
import { authenticateToken } from "@/utils/auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

// api/volunteer/license
export async function GET(req: NextRequest) {
  try {
    const { userId, error } = await authenticateToken(req);
    if(error) return error;
    const record = await db
      .select()
      .from(license)
      .where(eq(license.userId,userId!)).limit(1);

    return NextResponse.json(record);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
